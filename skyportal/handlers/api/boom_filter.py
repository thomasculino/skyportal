# from pymongo import MongoClient
import requests
from marshmallow.exceptions import ValidationError
from sqlalchemy.orm import joinedload
from sqlalchemy.orm.attributes import flag_modified

from baselayer.app.access import auth_or_token, permissions

from ...models import Filter
from ..base import BaseHandler


class BoomFilterHandler(BaseHandler):
    @auth_or_token
    def get(self, filter_id):
        """
        ---
        summary: Get a filter
        description: Retrieve a filter
        tags:
          - filters
        parameters:
          - in: path
            name: filter_id
            required: true
            schema:
              type: integer
        responses:
          200:
            content:
              application/json:
                schema: SingleFilter
          400:
            content:
              application/json:
                schema: Error
        """
        with self.Session() as session:
            if filter_id is not None:
                f = session.scalar(
                    Filter.select(
                        session.user_or_token, options=[joinedload(Filter.stream)]
                    ).where(Filter.id == filter_id)
                )
                if f is None:
                    return self.error(f"Cannot find a filter with ID: {filter_id}.")

                if f.altdata is not None and "boom" in f.altdata:
                    auth_url = "http://localhost:4000/auth"
                    auth_payload = {"username": "admin", "password": "adminsecret"}
                    auth_response = requests.post(auth_url, json=auth_payload)
                    auth_response.raise_for_status()
                    token = auth_response.json()["access_token"]

                    boom_url = f"http://localhost:4000/filters/{f.altdata['boom']['filter_id']}"

                    headers = {
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    }

                    response = requests.get(boom_url, headers=headers)
                    response.raise_for_status()

                    f = session.scalar(
                        Filter.select(
                            session.user_or_token, options=[joinedload(Filter.stream)]
                        ).where(
                            Filter.altdata["boom"]["filter_id"].astext
                            == str(response.json()["data"]["id"])
                        )
                    )
                    f.fv = response.json()["data"]["fv"]
                    f.active_fid = response.json()["data"]["active_fid"]
                    f.active = response.json()["data"]["active"]
                    f.filters = f.altdata["filters"]

                return self.success(data=f)

            filters = session.scalars(Filter.select(session.user_or_token)).all()
            return self.success(data=filters)

    @permissions(["Upload data"])
    def post(self, filter_id=None):
        """
        ---
        summary: Create a new filter
        description: POST a new filter.
        tags:
          - filters
        requestBody:
          content:
            application/json:
              schema: FilterNoID
        responses:
          200:
            content:
              application/json:
                schema:
                  allOf:
                    - $ref: '#/components/schemas/Success'
                    - type: object
                      properties:
                        data:
                          type: object
                          properties:
                            id:
                              type: integer
                              description: New filter ID
        """
        data = self.get_json()
        with self.Session() as session:
            if filter_id is not None:
                f = session.scalar(
                    Filter.select(session.user_or_token, mode="update").where(
                        Filter.id == filter_id
                    )
                )

                if f is None:
                    return self.error(f"Cannot find a filter with ID: {filter_id}.")

                if not f.altdata:
                    auth_url = "http://localhost:4000/auth"
                    auth_payload = {"username": "admin", "password": "adminsecret"}
                    auth_response = requests.post(auth_url, json=auth_payload)
                    auth_response.raise_for_status()
                    token = auth_response.json()["access_token"]

                    data_url = "http://localhost:4000/filters"
                    data_payload = {
                        "pipeline": data["altdata"],
                        "permissions": f.stream.altdata["selector"],
                        "catalog": f.stream.altdata["collection"],
                    }

                    headers = {
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    }
                    response = requests.post(
                        data_url, json=data_payload, headers=headers
                    )
                    response.raise_for_status()
                    data = {
                        "altdata": {
                            "boom": {"filter_id": response.json()["data"]["id"]},
                            "autoAnnotate": False,
                            "autoSave": False,
                            "autoFollowup": False,
                            "filters": [
                                {
                                    "fid": response.json()["data"]["active_fid"],
                                    "version": data["filters"],
                                }
                            ],
                        },
                    }
                else:
                    auth_url = "http://localhost:4000/auth"
                    auth_payload = {"username": "admin", "password": "adminsecret"}
                    auth_response = requests.post(auth_url, json=auth_payload)
                    auth_response.raise_for_status()
                    token = auth_response.json()["access_token"]

                    data_url = f"http://localhost:4000/filters/{f.altdata['boom']['filter_id']}/versions"
                    data_payload = {
                        "pipeline": data["altdata"],
                    }

                    headers = {
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    }
                    response = requests.post(
                        data_url, json=data_payload, headers=headers
                    )
                    response.raise_for_status()

                    f.altdata["filters"].append(
                        {
                            "fid": response.json()["data"]["fid"],
                            "version": data["filters"],
                        }
                    )
                    flag_modified(f, "altdata")
                    data = {}

                for k in data:
                    setattr(f, k, data[k])

            schema = Filter.__schema__()
            try:
                fil = schema.load(data, partial=bool(filter_id))
            except ValidationError as e:
                return self.error(
                    f"Invalid/missing parameters: {e.normalized_messages()}"
                )

            if filter_id is None:
                session.add(fil)
            session.commit()
            return self.success()

    @permissions(["Upload data"])
    def patch(self, filter_id):
        """
        ---
        summary: Update a filter
        description: Update filter name
        tags:
          - filters
        parameters:
          - in: path
            name: filter_id
            required: True
            schema:
              type: integer
        requestBody:
          content:
            application/json:
              schema: FilterNoID
        responses:
          200:
            content:
              application/json:
                schema: Success
          400:
            content:
              application/json:
                schema: Error
        """
        with self.Session() as session:
            f = session.scalar(
                Filter.select(session.user_or_token, mode="update").where(
                    Filter.id == filter_id
                )
            )
            if f is None:
                return self.error(f"Cannot find a filter with ID: {filter_id}.")

            data = self.get_json()
            if "active" in data or "active_fid" in data:
                # Step 1: Authenticate to get a JWT token
                auth_url = "http://localhost:4000/auth"
                auth_payload = {"username": "admin", "password": "adminsecret"}
                auth_response = requests.post(auth_url, json=auth_payload)
                auth_response.raise_for_status()
                token = auth_response.json()["access_token"]

                # Step 2: Prepare your data payload
                data_url = f"http://localhost:4000/filters/{f.altdata['boom']['filter_id']}"  # e.g., /filters, /queries, etc.
                data_payload = {
                    # Your data here, e.g. for /filters:
                    "active": data["active"],
                    "active_fid": data["active_fid"],
                }

                # Step 3: Send the PATCH request with the token
                headers = {
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                }
                response = requests.patch(data_url, json=data_payload, headers=headers)
                response.raise_for_status()
            elif "autoAnnotate" in data:
                f.altdata["autoAnnotate"] = data["autoAnnotate"]
                flag_modified(f, "altdata")
            elif "autoSave" in data:
                f.altdata["autoSave"] = data["autoSave"]
                flag_modified(f, "altdata")
            elif "autoFollowup" in data:
                f.altdata["autoFollowup"] = data["autoFollowup"]
                flag_modified(f, "altdata")

            data = {}

            schema = Filter.__schema__()
            try:
                fil = schema.load(data, partial=True)
            except ValidationError as e:
                return self.error(
                    f"Invalid/missing parameters: {e.normalized_messages()}"
                )

            for k in data:
                setattr(f, k, data[k])

            session.commit()
            return self.success()

    @permissions(["Upload data"])
    def delete(self, filter_id):
        """
        ---
        summary: Delete a filter
        description: Delete a filter
        tags:
          - filters
        parameters:
          - in: path
            name: filter_id
            required: true
            schema:
              type: integer
        responses:
          200:
            content:
              application/json:
                schema: Success
        """

        with self.Session() as session:
            f = session.scalars(
                Filter.select(session.user_or_token, mode="delete").where(
                    Filter.id == filter_id
                )
            ).first()
            if f is None:
                return self.error(f"Cannot find a filter with ID: {filter_id}.")
            session.delete(f)
            session.commit()
            return self.success()
