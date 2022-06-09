import React from "react";
import { useDispatch } from "react-redux";

import PropTypes from "prop-types";

import { Button } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

import * as sourceActions from "../ducks/source";
import * as gcnEventActions from "../ducks/gcnEvent";
import * as shiftActions from "../ducks/shift";

const DeleteComment = ({
  associatedResourceType = "object",
  objID = null,
  gcnEventID = null,
  spectrum_id = null,
  id = null,
  hoverID = null,
  shift_id = null,
}) => {
  const dispatch = useDispatch();
  const deleteComment = (sourceID, commentID) => {
    dispatch(sourceActions.deleteComment(sourceID, commentID));
  };

  const deleteCommentOnSpectrum = (commentSpectrumID, commentID) => {
    dispatch(
      sourceActions.deleteCommentOnSpectrum(commentSpectrumID, commentID)
    );
  };

  const deleteCommentOnGcnEvent = (gcnID, commentID) => {
    dispatch(gcnEventActions.deleteCommentOnGcnEvent(gcnID, commentID));
  };

  const deleteCommentOnShift = (shiftID, commentID) => {
    dispatch(shiftActions.deleteCommentOnShift(shiftID, commentID));
  };

  return (
    <>
      {associatedResourceType === "gcn_event" && (
        <Button
          style={
            hoverID === id
              ? {
                  display: "block",
                  minWidth: "0",
                  lineHeight: "0",
                  padding: "0",
                }
              : { display: "none" }
          }
          size="small"
          color="primary"
          type="button"
          name={`deleteCommentButtonGcnEvent${id}`}
          onClick={() => deleteCommentOnGcnEvent(gcnEventID, id)}
          className="commentDelete"
        >
          <CloseIcon fontSize="small" />
        </Button>
      )}
      {associatedResourceType === "shift" && (
        <Button
          style={
            hoverID === id
              ? {
                  display: "block",
                  minWidth: "0",
                  lineHeight: "0",
                  padding: "0",
                }
              : { display: "none" }
          }
          size="small"
          color="primary"
          type="button"
          name={`deleteCommentButtonShift${id}`}
          onClick={() => deleteCommentOnShift(shift_id, id)}
          className="commentDelete"
        >
          <CloseIcon fontSize="small" />
        </Button>
      )}
      {(associatedResourceType === "object" ||
        associatedResourceType === "spectra") && (
        <Button
          style={
            hoverID === id
              ? {
                  display: "block",
                  minWidth: "0",
                  lineHeight: "0",
                  padding: "0",
                }
              : { display: "none" }
          }
          size="small"
          color="primary"
          name={`deleteCommentButton${
            (spectrum_id ? "Spectrum" : "Source") + id
          }`}
          onClick={() =>
            spectrum_id
              ? deleteCommentOnSpectrum(spectrum_id, id)
              : deleteComment(objID, id)
          }
          className="commentDelete"
        >
          <CloseIcon fontSize="small" />
        </Button>
      )}
    </>
  );
};

DeleteComment.propTypes = {
  associatedResourceType: PropTypes.string,
  objID: PropTypes.string,
  gcnEventID: PropTypes.string,
  spectrum_id: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  hoverID: PropTypes.number,
  shift_id: PropTypes.number,
};

DeleteComment.defaultProps = {
  associatedResourceType: "object",
  objID: null,
  gcnEventID: null,
  spectrum_id: null,
  id: null,
  hoverID: null,
  shift_id: null,
};

export default DeleteComment;