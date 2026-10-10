"""BOOM's linked tracks reach SkyPortal by polling, not through filtered alerts.

BOOM is faked at its one HTTP seam (``boom._request``) with fixtures shaped like
the track route's contract.
"""

import asyncio
import random
import uuid

import pytest
import sqlalchemy as sa

from skyportal.broker_apis import boom
from skyportal.broker_apis.boom import BOOMBROKER, _tracks_config
from skyportal.models import (
    Annotation,
    Broker,
    BrokerIngestCursor,
    Comment,
    DBSession,
    Instrument,
    Obj,
    Photometry,
    Source,
    SuperObj,
)
from skyportal.tests.fixtures import GroupFactory, InstrumentFactory, StreamFactory
from skyportal.utils import sso_ingest
from skyportal.utils.sso_ingest import designation_to_obj_id, track_to_obj_id


class FakeBoom:
    """Serves ``GET surveys/ztf/tracks[/{id}]`` and the alert lookups."""

    def __init__(self):
        self.tracks = {}
        self.alerts = {}
        self.merged = {}

    def epochs(self, jds, programid=1, ra0=10.0):
        out = []
        for i, jd in enumerate(jds):
            candid = random.randrange(10**18, 10**19)
            ra, dec = ra0 + 0.01 * i, 20.0 + 0.005 * i
            self.alerts[candid] = {
                "jd": jd,
                "ra": ra,
                "dec": dec,
                "magpsf": 20.0,
                "band": "r",
                "programid": programid,
                "psfFlux": 3500.0 + i,
                "psfFluxErr": 150.0,
            }
            out.append(
                {
                    "candid": candid,
                    "jd": jd,
                    "ra": ra,
                    "dec": dec,
                    "magpsf": 20.0,
                    "sigmapsf": 0.05,
                    "band": "r",
                }
            )
        return out

    def put(self, track_id, updated_at, epochs, designation=None, **fields):
        jds = [e["jd"] for e in epochs]
        self.tracks[track_id] = {
            "_id": track_id,
            "members": [e["candid"] for e in epochs],
            "epochs": epochs,
            "n_detections": len(epochs),
            "n_nights": len({int(jd) for jd in jds}),
            "arc_days": max(jds) - min(jds),
            "first_jd": min(jds),
            "last_jd": max(jds),
            "bound_fit": "good",
            "bound_fit_residual_arcsec": 0.3,
            "bound_fit_detections": len(epochs),
            "designation": designation,
            "updated_at": updated_at,
            **fields,
        }

    def absorb(self, absorbed_id, survivor_id):
        self.tracks.pop(absorbed_id)
        self.merged[absorbed_id] = survivor_id

    def __call__(self, broker, method, path, *, params=None, json=None, **kwargs):
        if method == "GET" and path == "surveys/ztf/tracks":
            feed = sorted(
                self.tracks.values(), key=lambda t: (t["updated_at"], t["_id"])
            )
            if "cursor" in params:
                at, tid = params["cursor"].split("|")
                feed = [t for t in feed if (t["updated_at"], t["_id"]) > (int(at), tid)]
            else:
                feed = [t for t in feed if t["updated_at"] >= params["updated_since"]]
            page = feed[: params["limit"]]
            last = page[-1] if page else None
            return {
                "tracks": page,
                "next_cursor": f"{last['updated_at']}|{last['_id']}" if last else None,
            }
        if method == "GET" and path.startswith("surveys/ztf/tracks/"):
            track_id = path.rsplit("/", 1)[1]
            return self.tracks[self.merged.get(track_id, track_id)]
        if method == "POST" and path == "queries/find":
            assert json["catalog_name"] == "ZTF_alerts"
            ids = json["filter"]["_id"]["$in"]
            allowed = json["filter"].get("candidate.programid", {}).get("$in")
            return [
                {"_id": c, "objectId": f"ZTF{c % 10**8}", "candidate": self.alerts[c]}
                for c in ids
                if c in self.alerts
                and (allowed is None or self.alerts[c]["programid"] in allowed)
            ]
        raise AssertionError(f"unexpected BOOM call {method} {path}")


@pytest.fixture()
def fake_boom(monkeypatch):
    fake = FakeBoom()
    monkeypatch.setattr(boom, "_request", fake)
    return fake


@pytest.fixture()
def ztf_instrument():
    created = None
    if (
        DBSession().scalar(sa.select(Instrument).where(Instrument.name == "ZTF"))
        is None
    ):
        created = InstrumentFactory(name="ZTF")
        DBSession().commit()
    yield
    if created is not None:
        InstrumentFactory.teardown(created)


@pytest.fixture()
def ztf_groups():
    """A public group (programid 1) and a partnership group (1 and 2)."""
    public = StreamFactory(altdata={"collection": "ZTF_alerts", "selector": [1]})
    partner = StreamFactory(altdata={"collection": "ZTF_alerts", "selector": [1, 2]})
    DBSession().commit()
    public_group = GroupFactory(streams=[public])
    partner_group = GroupFactory(streams=[public, partner])
    yield public_group, partner_group
    GroupFactory.teardown(public_group.id)
    GroupFactory.teardown(partner_group.id)
    StreamFactory.teardown(public.id)
    StreamFactory.teardown(partner.id)


@pytest.fixture()
def obj_ids():
    """Obj ids a test creates, removed afterwards."""
    ids = []
    yield ids
    session = DBSession()
    session.rollback()
    for model in (Source, Photometry, Annotation, Comment):
        session.execute(sa.delete(model).where(model.obj_id.in_(ids)))
    session.execute(sa.delete(Obj).where(Obj.id.in_(ids)))
    session.execute(
        sa.delete(SuperObj).where(
            SuperObj.name.in_([f"SSO {i.removeprefix('sso_')}" for i in ids])
        )
    )
    session.commit()


def make_broker(group_ids):
    broker = Broker(
        name=f"boom-{uuid.uuid4().hex[:8]}",
        broker_classname="BOOMBROKER",
        altdata={
            "host": "boom.test",
            "tracks": {"enabled": True, "group_ids": group_ids, "page_size": 2},
        },
    )
    DBSession().add(broker)
    DBSession().commit()
    return broker


@pytest.fixture()
def broker_for():
    made = []

    def make(group_ids):
        made.append(make_broker(group_ids))
        return made[-1]

    yield make
    for broker in made:
        DBSession().execute(sa.delete(Broker).where(Broker.id == broker.id))
    DBSession().commit()


def poll(broker):
    """Poll until BOOM has nothing newer, as the loop does between sleeps."""
    conf = _tracks_config(broker.altdata)
    while asyncio.run(BOOMBROKER.poll_tracks_page(broker, conf)) >= conf["page_size"]:
        pass


def new_track_id(obj_ids):
    track_id = f"BT{uuid.uuid4().hex[:6]}"
    obj_ids.append(track_to_obj_id(track_id))
    return track_id


def photometry_of(obj_id):
    DBSession().expire_all()
    return (
        DBSession()
        .scalars(sa.select(Photometry).where(Photometry.obj_id == obj_id))
        .all()
    )


def track_annotation(obj_id):
    DBSession().expire_all()
    return DBSession().scalar(
        sa.select(Annotation).where(
            Annotation.obj_id == obj_id, Annotation.origin == "boom:track"
        )
    )


def test_a_new_track_becomes_one_object_with_every_member_as_photometry(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    track_id = new_track_id(obj_ids)
    fake_boom.put(track_id, 100, fake_boom.epochs([2460000.7, 2460000.8, 2460001.7]))

    poll(broker)

    obj_id = track_to_obj_id(track_id)
    obj = DBSession().scalar(sa.select(Obj).where(Obj.id == obj_id))
    assert obj.is_roid is True
    # Not the triggering-detection rule: every member is this object.
    assert len(photometry_of(obj_id)) == 3
    assert obj.ra == pytest.approx(10.02)
    assert obj.altdata["last_detection_jd"] == 2460001.7
    sources = DBSession().scalars(sa.select(Source).where(Source.obj_id == obj_id))
    assert [s.group_id for s in sources] == [public_group.id]

    data = track_annotation(obj_id).data
    assert data["track_id"] == track_id
    assert data["n_detections"] == 3
    assert data["bound_fit"] == "good"
    assert data["unbound_candidate"] is False


def test_an_extended_track_gains_its_new_detections(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    track_id = new_track_id(obj_ids)
    epochs = fake_boom.epochs([2460000.7, 2460000.8, 2460001.7])
    fake_boom.put(track_id, 100, epochs)
    poll(broker)

    fake_boom.put(
        track_id, 200, epochs + fake_boom.epochs([2460003.7, 2460003.8], ra0=10.5)
    )
    poll(broker)

    obj_id = track_to_obj_id(track_id)
    assert len(photometry_of(obj_id)) == 5
    assert track_annotation(obj_id).data["n_detections"] == 5
    assert track_annotation(obj_id).data["updated_at"] == 200
    obj = DBSession().scalar(sa.select(Obj).where(Obj.id == obj_id))
    assert obj.altdata["last_detection_jd"] == 2460003.8


def test_an_absorbed_track_folds_into_the_survivor(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids, super_admin_user
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    absorbed_id, survivor_id = new_track_id(obj_ids), new_track_id(obj_ids)
    absorbed_epochs = fake_boom.epochs([2460000.7, 2460000.8, 2460001.7])
    survivor_epochs = fake_boom.epochs([2460003.7, 2460003.8], ra0=10.5)
    fake_boom.put(absorbed_id, 100, absorbed_epochs)
    fake_boom.put(survivor_id, 100, survivor_epochs)
    poll(broker)

    absorbed_obj, survivor_obj = (
        track_to_obj_id(absorbed_id),
        track_to_obj_id(survivor_id),
    )
    DBSession().add(
        Comment(
            obj_id=absorbed_obj,
            text="worth a look",
            author_id=super_admin_user.id,
            groups=[public_group],
        )
    )
    DBSession().commit()

    fake_boom.put(
        survivor_id, 200, absorbed_epochs + survivor_epochs, absorbed_ids=[absorbed_id]
    )
    fake_boom.absorb(absorbed_id, survivor_id)
    poll(broker)

    # Each detection once, though it arrived under both ids.
    assert len(photometry_of(survivor_obj)) == 5
    assert photometry_of(absorbed_obj) == []
    comments = DBSession().scalars(
        sa.select(Comment).where(Comment.obj_id == survivor_obj)
    )
    assert [c.text for c in comments] == ["worth a look"]
    assert DBSession().scalars(
        sa.select(Source.group_id).where(Source.obj_id == survivor_obj)
    ).all() == [public_group.id]
    assert (
        DBSession()
        .scalars(sa.select(Source).where(Source.obj_id == absorbed_obj))
        .all()
        == []
    )
    absorbed = DBSession().scalar(sa.select(Obj).where(Obj.id == absorbed_obj))
    assert absorbed.altdata["absorbed_into"] == survivor_obj


def test_a_recovery_keys_on_its_designation_and_a_discovery_on_its_track(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    designation = f"2026 {uuid.uuid4().hex[:4].upper()}"
    obj_ids.append(designation_to_obj_id(designation))
    recovery, discovery = new_track_id(obj_ids), new_track_id(obj_ids)
    fake_boom.put(recovery, 100, fake_boom.epochs([2460000.7, 2460001.7]), designation)
    fake_boom.put(discovery, 100, fake_boom.epochs([2460000.7, 2460001.7], ra0=40))
    poll(broker)

    sso_obj = designation_to_obj_id(designation)
    obj = DBSession().scalar(sa.select(Obj).where(Obj.id == sso_obj))
    assert obj.mpc_name == designation
    assert obj.alias == [f"SSO {designation}"]
    assert len(photometry_of(sso_obj)) == 2
    data = track_annotation(sso_obj).data
    assert (data["track_id"], data["designation"]) == (recovery, designation)
    super_obj = DBSession().scalar(
        sa.select(SuperObj).where(SuperObj.name == f"SSO {designation}")
    )
    assert sso_obj in {o.id for o in super_obj.objs}
    assert (
        DBSession().scalar(sa.select(Obj).where(Obj.id == track_to_obj_id(recovery)))
        is None
    )

    assert track_annotation(track_to_obj_id(discovery)).data["designation"] is None
    assert len(photometry_of(track_to_obj_id(discovery))) == 2


def test_a_track_named_later_folds_into_its_designation(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    designation = f"2026 {uuid.uuid4().hex[:4].upper()}"
    obj_ids.append(designation_to_obj_id(designation))
    track_id = new_track_id(obj_ids)
    epochs = fake_boom.epochs([2460000.7, 2460001.7])
    fake_boom.put(track_id, 100, epochs)
    poll(broker)

    fake_boom.put(track_id, 200, epochs, designation)
    poll(broker)

    assert len(photometry_of(designation_to_obj_id(designation))) == 2
    assert photometry_of(track_to_obj_id(track_id)) == []


def test_no_bound_fit_flags_the_track(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    track_id = new_track_id(obj_ids)
    fake_boom.put(
        track_id,
        100,
        fake_boom.epochs([2460000.7, 2460001.7, 2460002.7]),
        bound_fit="none",
        bound_fit_residual_arcsec=None,
        bound_fit_detections=0,
    )
    poll(broker)

    data = track_annotation(track_to_obj_id(track_id)).data
    assert data["bound_fit"] == "none"
    assert data["bound_fit_residual_arcsec"] is None
    assert data["unbound_candidate"] is True


def test_a_restart_mid_page_neither_skips_nor_duplicates(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids, monkeypatch
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    track_ids = [new_track_id(obj_ids) for _ in range(3)]
    for i, track_id in enumerate(track_ids):
        fake_boom.put(track_id, 100 + i, fake_boom.epochs([2460000.7, 2460001.7]))

    ingest = sso_ingest.ingest_track
    calls = []

    async def dies_on_second(track, *args, **kwargs):
        calls.append(track["id"])
        if len(calls) == 2:
            raise RuntimeError("killed mid-page")
        return await ingest(track, *args, **kwargs)

    monkeypatch.setattr(sso_ingest, "ingest_track", dies_on_second)
    conf = _tracks_config(broker.altdata)
    with pytest.raises(RuntimeError):
        asyncio.run(BOOMBROKER.poll_tracks_page(broker, conf))
    # The page did not finish, so the cursor did not move past it.
    assert (
        DBSession().scalar(
            sa.select(BrokerIngestCursor).where(
                BrokerIngestCursor.broker_id == broker.id
            )
        )
        is None
    )

    monkeypatch.setattr(sso_ingest, "ingest_track", ingest)
    poll(broker)

    for track_id in track_ids:
        assert len(photometry_of(track_to_obj_id(track_id))) == 2
    assert asyncio.run(BOOMBROKER.poll_tracks_page(broker, conf)) == 0


def test_polling_the_same_page_again_changes_nothing(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids, monkeypatch
):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    track_id = new_track_id(obj_ids)
    fake_boom.put(track_id, 100, fake_boom.epochs([2460000.7, 2460001.7]))
    poll(broker)
    obj_id = track_to_obj_id(track_id)
    before = track_annotation(obj_id).modified

    ingest = sso_ingest.ingest_track
    results = []

    async def recorded(*args, **kwargs):
        results.append(await ingest(*args, **kwargs))
        return results[-1]

    monkeypatch.setattr(sso_ingest, "ingest_track", recorded)
    DBSession().execute(
        sa.delete(BrokerIngestCursor).where(BrokerIngestCursor.broker_id == broker.id)
    )
    DBSession().commit()
    poll(broker)

    assert results == [{"id": obj_id, "changed": False}]
    assert len(photometry_of(obj_id)) == 2
    assert track_annotation(obj_id).modified == before


def test_partnership_detections_are_withheld_from_a_public_group(
    fake_boom, ztf_instrument, ztf_groups, broker_for, obj_ids
):
    public_group, partner_group = ztf_groups
    mixed, private = new_track_id(obj_ids), new_track_id(obj_ids)
    public_epochs = fake_boom.epochs([2460000.7, 2460001.7], programid=1)
    partner_epochs = fake_boom.epochs([2460002.7, 2460003.7], programid=2)
    fake_boom.put(mixed, 100, public_epochs + partner_epochs)
    fake_boom.put(private, 101, fake_boom.epochs([2460000.7], programid=2, ra0=50))

    poll(broker_for([public_group.id]))

    points = photometry_of(track_to_obj_id(mixed))
    assert sorted(p.mjd + 2400000.5 for p in points) == pytest.approx(
        [2460000.7, 2460001.7]
    )
    # Nothing it may see, so not created at all.
    assert (
        DBSession().scalar(sa.select(Obj).where(Obj.id == track_to_obj_id(private)))
        is None
    )

    poll(broker_for([partner_group.id]))
    assert len(photometry_of(track_to_obj_id(mixed))) == 4


def test_get_track_resolves_a_merged_id(fake_boom, ztf_groups, broker_for, obj_ids):
    public_group, _ = ztf_groups
    broker = broker_for([public_group.id])
    absorbed_id, survivor_id = new_track_id(obj_ids), new_track_id(obj_ids)
    epochs = fake_boom.epochs([2460000.7, 2460001.7, 2460002.7])
    fake_boom.put(absorbed_id, 100, epochs[:2])
    fake_boom.put(
        survivor_id, 200, epochs, bound_fit="poor", absorbed_ids=[absorbed_id]
    )
    fake_boom.absorb(absorbed_id, survivor_id)

    track = BOOMBROKER.get_track(
        broker, absorbed_id, None, survey="ZTF", permissions={"ZTF": [1]}
    )

    assert track["id"] == survivor_id
    assert track["merged_from"] == absorbed_id
    assert track["bound_fit"] == "poor"
    assert track["bound_fit_residual_arcsec"] == 0.3
    assert track["bound_fit_detections"] == 3
    assert [d["jd"] for d in track["detections"]] == [2460000.7, 2460001.7, 2460002.7]
    assert track["members_withheld"] == 0


@pytest.mark.parametrize("process_index,polls", [(0, True), (1, False)])
def test_only_process_zero_polls_tracks(monkeypatch, process_index, polls):
    started = []

    async def fake_poll(broker, stop=None):
        started.append(broker)

    async def no_stream(*args, **kwargs):
        return 0

    monkeypatch.setattr(BOOMBROKER, "poll_tracks", staticmethod(fake_poll))
    monkeypatch.setattr(BOOMBROKER, "_consume_stream", staticmethod(no_stream))
    broker = Broker(
        id=0,
        name="boom",
        broker_classname="BOOMBROKER",
        altdata={"host": "boom.test", "tracks": {"enabled": True}},
    )

    asyncio.run(BOOMBROKER.run_ingestion(broker, process_index=process_index))

    assert bool(started) is polls
