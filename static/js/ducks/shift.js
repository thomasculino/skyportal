import messageHandler from "baselayer/MessageHandler";

import * as API from "../API";
import store from "../store";

const FETCH_SHIFT = "skyportal/FETCH_SHIFT";

const SUBMIT_SHIFT = "skyportal/SUBMIT_SHIFT";

const DELETE_SHIFT = "skyportal/DELETE_SHIFT";

const CURRENT_SHIFT = "skyportal/CURRENT_SHIFT";

const ADD_COMMENT_ON_SHIFT = "skyportal/ADD_COMMENT_ON_SHIFT";
const DELETE_COMMENT_ON_SHIFT = "skyportal/DELETE_COMMENT_ON_SHIFT";

const REFRESH_CURRENT_SHIFT_COMMENTS =
  "skyportal/REFRESH_CURRENT_SHIFT_COMMENTS";

const GET_COMMENT_ON_SHIFT_ATTACHMENT =
  "skyportal/GET_COMMENT_ON_SHIFT_ATTACHMENT";
const GET_COMMENT_ON_SHIFT_ATTACHMENT_OK =
  "skyportal/GET_COMMENT_ON_SHIFT_ATTACHMENT_OK";

const GET_COMMENT_ON_SHIFT_ATTACHMENT_PREVIEW =
  "skyportal/GET_COMMENT_ON_SHIFT_ATTACHMENT_PREVIEW";
const GET_COMMENT_ON_SHIFT_ATTACHMENT_PREVIEW_OK =
  "skyportal/GET_COMMENT_ON_SHIFT_ATTACHMENT_PREVIEW_OK";
const CURRENT_SHIFT_SELECTED_USERS = "skyportal/CURRENT_SHIFT_SELECTED_USERS";

export const fetchShift = (id) => API.GET(`/api/shifts/${id}`, FETCH_SHIFT);

export const submitShift = (run) => API.POST(`/api/shifts`, SUBMIT_SHIFT, run);

export function deleteShift(shiftID) {
  return API.DELETE(`/api/shifts/${shiftID}`, DELETE_SHIFT);
}

export function addCommentOnShift(formData) {
  function fileReaderPromise(file) {
    return new Promise((resolve) => {
      const filereader = new FileReader();
      filereader.readAsDataURL(file);
      filereader.onloadend = () =>
        resolve({ body: filereader.result, name: file.name });
    });
  }
  if (formData.attachment) {
    return (dispatch) => {
      fileReaderPromise(formData.attachment).then((fileData) => {
        formData.attachment = fileData;

        dispatch(
          API.POST(
            `/api/shift/${formData.shift_id}/comments`,
            ADD_COMMENT_ON_SHIFT,
            formData
          )
        );
      });
    };
  }
  return API.POST(
    `/api/shift/${formData.shift_id}/comments`,
    ADD_COMMENT_ON_SHIFT,
    formData
  );
}

export function deleteCommentOnShift(shiftID, commentID) {
  return API.DELETE(
    `/api/shift/${shiftID}/comments/${commentID}`,
    DELETE_COMMENT_ON_SHIFT
  );
}

export function getCommentOnShiftAttachment(shiftID, commentID) {
  return API.GET(
    `/api/shift/${shiftID}/comments/${commentID}/attachment`,
    GET_COMMENT_ON_SHIFT_ATTACHMENT
  );
}

export function getCommentOnShiftAttachmentPreview(shiftID, commentID) {
  return API.GET(
    `/api/shift/${shiftID}/comments/${commentID}`,
    GET_COMMENT_ON_SHIFT_ATTACHMENT_PREVIEW
  );
}

// Websocket message handler
messageHandler.add((actionType, payload, dispatch, getState) => {
  const { shift } = getState();
  if (actionType === FETCH_SHIFT) {
    dispatch(fetchShift(shift.id));
  }
  if (actionType === REFRESH_CURRENT_SHIFT_COMMENTS) {
    const shift_id = shift?.currentShift.id;
    if (shift_id === payload.obj_internal_key) {
      dispatch(fetchShift(shift.currentShift.id));
    }
  }
});

const reducer = (state = { currentShift: {}, selectedUsers: [] }, action) => {
  switch (action.type) {
    case CURRENT_SHIFT: {
      const currentShift = action.data;
      return {
        ...state,
        currentShift,
      };
    }
    case GET_COMMENT_ON_SHIFT_ATTACHMENT_OK: {
      const { commentId, text, attachment, attachment_name } = action.data;
      return {
        ...state,
        commentAttachment: {
          commentId,
          text,
          attachment,
          attachment_name,
        },
      };
    }
    case GET_COMMENT_ON_SHIFT_ATTACHMENT_PREVIEW_OK: {
      const { commentId, text, attachment, attachment_name } = action.data;
      return {
        ...state,
        commentAttachment: {
          commentId,
          text,
          attachment,
          attachment_name,
        },
      };
    }
    case CURRENT_SHIFT_SELECTED_USERS: {
      const selectedUsers = action.data;
      return {
        ...state,
        selectedUsers,
      };
    }
    default:
      return state;
  }
};

store.injectReducer("shift", reducer);
