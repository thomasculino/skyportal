import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import PropTypes from "prop-types";

import IconButton from "@mui/material/IconButton";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";

import * as Actions from "../ducks/favorites";

const ButtonInclude = (sourceID, textMode) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await dispatch(Actions.removeFromFavorites(sourceID));
    setIsSubmitting(false);
  };
  if (textMode) {
    return (
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        variant="contained"
        data-testid={`favorites-text-include_${sourceID}`}
      >
        Remove favorite
      </Button>
    );
  }
  return (
    <Tooltip title="click to remove this source from favorites">
      <IconButton
        onClick={handleSubmit}
        data-testid={`favorites-include_${sourceID}`}
        disabled={isSubmitting}
        size="large"
      >
        <StarIcon />
      </IconButton>
    </Tooltip>
  );
};

const ButtonExclude = (sourceID, textMode) => {
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    setIsSubmitting(true);
    await dispatch(Actions.addToFavorites(sourceID));
    setIsSubmitting(false);
  };
  if (textMode) {
    return (
      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        variant="contained"
        data-testid={`favorites-text-exclude_${sourceID}`}
      >
        Add favorite
      </Button>
    );
  }
  return (
    <Tooltip title="click to add this source to favorites">
      <IconButton
        onClick={handleSubmit}
        data-testid={`favorites-exclude_${sourceID}`}
        disabled={isSubmitting}
        size="large"
      >
        <StarBorderIcon />
      </IconButton>
    </Tooltip>
  );
};

const FavoritesButton = ({ sourceID, textMode }) => {
  const { favorites } = useSelector((state) => state.favorites);

  if (!sourceID) {
    return null;
  }
  if (favorites.includes(sourceID)) {
    return ButtonInclude(sourceID, textMode);
  }
  return ButtonExclude(sourceID, textMode);
};

FavoritesButton.propTypes = {
  sourceID: PropTypes.string.isRequired,
};

export default FavoritesButton;
