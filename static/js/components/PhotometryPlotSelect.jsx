import React from "react";
import PropTypes from "prop-types";
import Select from "@material-ui/core/Select";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { MenuItem, Checkbox, Box, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import ListItemText from "@material-ui/core/ListItemText";
import Chip from "@material-ui/core/Chip";

const useStyles = makeStyles(() => ({
  form: {
    width: "12rem",
    height: "5rem",
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function photometry_to_filters(photometry) {
  const set_filters = new Set();
  const set_origin = new Set();
  for (const key in Object.keys(...photometry)) {
    if (Object.keys(...photometry).hasOwnProperty(key)) {
      const element = Object.keys(...photometry)[key];
      set_filters.add(element.filter);
      set_origin.add(element.origin);
    }
  }
  return [Array.from(set_filters), Array.from(set_origin)];
}

const PhotometryPlotSelect = (props) => {
  const {
    photometry,
    // photometryPlotFilter,
    // setPhotometryPlotFilter,
    // photometryPlotOrigin,
    // setPhotometryPlotOrigin,
  } = props;
  const classes = useStyles();
  // const [selectedFilters, setSelectedFilters] = React.useState(photometryPlotFilter);
  const [selectedFilterFilters, setSelectedFilterFilters] = React.useState([]);
  const [selectedOriginFilters, setSelectedOriginFilters] = React.useState([]);

  const photometryData = photometry_to_filters(photometry);

  return (
    <>
      <FormControl className={classes.form}>
        <InputLabel id="demo-simple-select-helper-label">
          Select photometry filter
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label"
          id="demo-simple-select-helper"
          multiple
          value={selectedFilterFilters}
          label="Select photometry filter"
          onChange={(event) => {
            setSelectedFilterFilters(event.target.value);
            // console.log(selectedFilters);
            // setSelectedFilters(add_filters(event));
          }}
          renderValue={(selected) => (
            <Box>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {photometryData[0].map((spec) => (
            <MenuItem value={spec}>
              <Checkbox checked={selectedFilterFilters.indexOf(spec) > -1} />
              <ListItemText primary={spec} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.form}>
        <InputLabel id="demo-simple-select-helper-label-2">
          Select origin filter
        </InputLabel>
        <Select
          labelId="demo-simple-select-helper-label-2"
          id="demo-simple-select-helper-2"
          multiple
          value={selectedOriginFilters}
          label="Select photometry origin"
          onChange={(event) => {
            setSelectedOriginFilters(event.target.value);
            // console.log(selectedFilters);
            // setSelectedFilters(add_filters(event));
          }}
          renderValue={(selected) => (
            <Box>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {photometryData[1].map((spec) => (
            <MenuItem value={spec}>
              <Checkbox checked={selectedOriginFilters.indexOf(spec) > -1} />
              <ListItemText primary={spec} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
      // onClick={() => {
      //   console.log('photometry', photometry);
      //   setPhotometryPlotFilter(selectedFilterFilters);
      //   setPhotometryPlotOrigin(selectedOriginFilters);
      // }}
      >
        Submit
      </Button>
    </>
  );
};

PhotometryPlotSelect.propTypes = {
  photometry: PropTypes.arrayOf(
    PropTypes.shape({
      filter: PropTypes.string,
    })
  ).isRequired,
  // photometryPlotFilter: PropTypes.string.isRequired,
};

export default PhotometryPlotSelect;
