import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import TextField from "@material-ui/core/TextField";

import { makeStyles } from "@material-ui/core/styles";

import * as profileActions from "../ducks/profile";
import UserPreferencesHeader from "./UserPreferencesHeader";

const useStyles = makeStyles((theme) => ({
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    "& p": {
      color: "red",
    },
  },
}));

const SlackPreferences = () => {
  const classes = useStyles();
  const slack_preamble = useSelector((state) => state.config.slackPreamble);
  const profile = useSelector((state) => state.profile.preferences);
  const dispatch = useDispatch();
  const [slackurl, setSlackurl] = useState(profile.slack_integration?.url);
  const [slackurlerror, setSlackurlerror] = useState(false);

  const handleChange = (event) => {
    setSlackurl(event.target.value);
  };

  const handleBlur = () => {
    if (slackurl?.startsWith(slack_preamble)) {
      setSlackurlerror(false);
      const prefs = {
        slack_integration: {
          url: slackurl,
        },
      };
      dispatch(profileActions.updateUserPreferences(prefs));
    } else {
      setSlackurlerror(true);
    }
  };

  const prefToggled = (event) => {
    const prefs = {
      slack_integration: {
        [event.target.name]: event.target.checked,
      },
    };

    dispatch(profileActions.updateUserPreferences(prefs));
  };

  return (
    <div>
      <UserPreferencesHeader
        title="Slack Integration"
        popupText="You'll need to ask your site administrator to give you a unique
          URL that posts to your Slack channel. Activating the Slack integration
          will allow you to see all @ mentions of this account and configure
          other notifications below."
      />
      <FormGroup row>
        <FormControlLabel
          control={
            <Switch
              checked={profile.slack_integration?.active === true}
              name="active"
              onChange={prefToggled}
              data-testid="slack_toggle"
            />
          }
          label={profile.slack_integration?.active ? "Active" : "Inactive"}
        />
      </FormGroup>
      {profile.slack_integration?.active && (
        <>
          <div>
            <TextField
              name="url"
              label="Integration URL"
              className={classes.textField}
              fullWidth
              placeholder="Unique URL connecting to your Slack channel"
              defaultValue={profile.slack_integration?.url}
              onChange={handleChange}
              onBlur={handleBlur}
              margin="normal"
              data-testid="slack_url"
              helperText={slackurlerror ? "Must be a Slack URL" : ""}
              error={slackurlerror}
            />
          </div>
          <div>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.slack_integration?.mentions === true}
                    name="mentions"
                    onChange={prefToggled}
                    data-testid="slack_mentions"
                  />
                }
                label="@ mentions"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={profile.slack_integration?.gcnnotices === true}
                    name="gcnnotices"
                    onChange={prefToggled}
                    data-testid="slack_gcnnotices"
                  />
                }
                label="GCN Notices"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      profile.slack_integration?.facilitytransactions === true
                    }
                    name="facilitytransactions"
                    onChange={prefToggled}
                    data-testid="slack_facilitytransactions"
                  />
                }
                label="Facility Transactions"
              />
            </FormGroup>
          </div>
        </>
      )}
    </div>
  );
};

export default SlackPreferences;
