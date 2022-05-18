import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";

import * as profileActions from "../ducks/profile";
import * as recentGcnEventsActions from "../ducks/recentGcnEvents";
import * as sourcesActions from "../ducks/sources";
import WidgetPrefsDialog from "./WidgetPrefsDialog";
import GcnTags from "./GcnTags";

dayjs.extend(relativeTime);
dayjs.extend(utc);

const useStyles = makeStyles((theme) => ({
  header: {},
  eventListContainer: {
    height: "calc(100% - 5rem)",
    overflowY: "auto",
    marginTop: "0.625rem",
    paddingTop: "0.625rem",
  },
  eventList: {
    display: "block",
    alignItems: "center",
    listStyleType: "none",
    paddingLeft: 0,
    marginTop: 0,
  },
  eventNameContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  eventNameLink: {
    color: theme.palette.primary.main,
  },
  eventTags: {
    marginLeft: "1rem",
    "& > div": {
      margin: "0.25rem",
      color: "white",
      background: theme.palette.primary.main,
    },
  },
  eventSources: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  listItem: {
    width: "max-content",
  },
}));

const defaultPrefs = {
  maxNumEvents: "5",
};

const RecentGcnEvents = ({ classes }) => {
  const styles = useStyles();
  const [gcnEventsSources, setGcnEventsSources] = useState([]);
  const [recentGcnSources, setRecentGcnSources] = useState("");

  const gcnEvents = useSelector((state) => state.recentGcnEvents);
  const recentEvents =
    useSelector((state) => state.profile.preferences?.recentGcnEvents) ||
    defaultPrefs;

  const recentEventSources = useSelector(
    (state) => state.sources?.gcnEventSources
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(recentGcnEventsActions.fetchRecentGcnEvents());
  }, [dispatch]);

  useEffect(() => {
    if (recentEventSources) {
      setRecentGcnSources((state) => ({
        ...state,
        [recentEventSources.sources?.length]: recentEventSources,
      }));
    }
  }, [recentEventSources]);

  const gcnEventSourcesAssociated = (gcnEvent) => {
    dispatch(sourcesActions.fetchGcnEventSources(gcnEvent.dateobs));
  };

  const getGcnEventSources = (gcnEventList) => {
    const gcnEventsSourcesTemp = [];
    gcnEventsSourcesTemp.push(
      gcnEventList.forEach((gcnEvent) => gcnEventSourcesAssociated(gcnEvent))
    );
    setGcnEventsSources(gcnEventsSourcesTemp);
  };

  if (gcnEventsSources?.length === 0 && gcnEvents) {
    getGcnEventSources(gcnEvents);
  } else if (gcnEventsSources?.length > 0 && gcnEvents) {
    setGcnEventsSources(recentEventSources);
  }

  const sourcesAssociated = (gcnEvent, index) => {
    let recentGcnSourcesDefined = Object.entries(recentGcnSources)[index] ?? [];
    if (recentGcnSourcesDefined[1]) {
      recentGcnSourcesDefined = recentGcnSourcesDefined[1].sources;
    }
    if (
      recentGcnSourcesDefined.length > 0 &&
      recentGcnSourcesDefined.length <= 2
    ) {
      return (
        <div className={styles.eventSources}>
          {recentGcnSources !== "" &&
            Object.values(recentGcnSources).map((gcn, idx) => {
              if (idx === index) {
                return (
                  <List>
                    {Object.entries(Object.values(gcn)[3]).map((item) => (
                      <ListItem key={item[1].id}>
                        <Link to={`/source/${item[1].id}`}>
                          <Button color="primary">{item[1].id}</Button>
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                );
              }
              return null;
            })}
        </div>
      );
    }
    return (
      <div className={styles.eventSources}>
        {recentGcnSources !== "" &&
          Object.values(recentGcnSources).map((gcn, idx) => {
            if (idx === index) {
              return (
                <List className={styles.eventSources}>
                  {Object.entries(Object.values(gcn)[3])
                    .slice(0, 2)
                    .map((item) => (
                      <ListItem key={item[1].id} className={styles.listItem}>
                        <Link to={`/source/${item[1].id}`}>
                          <Button color="primary">{item[1].id}</Button>
                        </Link>
                      </ListItem>
                    ))}
                  <Link to={`/gcn_events/${gcnEvent.dateobs}`}>
                    <Button color="primary">
                      <AddIcon />
                    </Button>
                  </Link>
                </List>
              );
            }
            return null;
          })}
      </div>
    );
  };

  return (
    <Paper elevation={1} className={classes.widgetPaperFillSpace}>
      <div className={classes.widgetPaperDiv}>
        <div className={styles.header}>
          <Typography variant="h6" display="inline">
            Recent GCN Events
          </Typography>
          <DragHandleIcon className={`${classes.widgetIcon} dragHandle`} />
          <div className={classes.widgetIcon}>
            <WidgetPrefsDialog
              // Only expose num events
              initialValues={{
                maxNumEvents: recentEvents.maxNumEvents,
              }}
              stateBranchName="recentGcnEvents"
              title="Recent Events Preferences"
              onSubmit={profileActions.updateUserPreferences}
            />
          </div>
        </div>
        <div className={styles.eventListContainer}>
          <p>Displaying most-viewed events</p>
          <ul className={styles.eventList}>
            {gcnEvents?.map((gcnEvent, index) => (
              <li key={gcnEvent.dateobs}>
                <div className={styles.eventNameContainer}>
                  &nbsp; -&nbsp;
                  <Link to={`/gcn_events/${gcnEvent.dateobs}`}>
                    <Button color="primary">
                      {dayjs(gcnEvent.dateobs).format("YYMMDD HH:mm:ss")}
                    </Button>
                  </Link>
                  <div>({dayjs().to(dayjs.utc(`${gcnEvent.dateobs}Z`))})</div>
                  <div className={styles.eventTags}>
                    <GcnTags gcnEvent={gcnEvent} />
                  </div>
                  {recentGcnSources !== "" &&
                    sourcesAssociated(gcnEvent, index)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Paper>
  );
};

RecentGcnEvents.propTypes = {
  classes: PropTypes.shape({
    widgetPaperDiv: PropTypes.string.isRequired,
    widgetIcon: PropTypes.string.isRequired,
    widgetPaperFillSpace: PropTypes.string.isRequired,
  }).isRequired,
};

export default RecentGcnEvents;
