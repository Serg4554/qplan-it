module.exports = {
  Error: error => {
    let err = new Error();
    err.code = error.code;
    err.statusCode = error.status;
    err.message = error.message;
    return err;
  },

  INVALID_CAPTCHA: {
    code: "INVALID_CAPTCHA",
    status: 422,
    message: "Please, verify the captcha"
  },
  PASSWORD_TOO_WEAK: {
    code: "PASSWORD_TOO_WEAK",
    status: 422,
    message: "Password must have at least 8 characters, uppercase and lowercase letters"
  },
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    status: 422,
    message: "There is already a user with that email"
  },
  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    status: 422,
    message: "The email is invalid, check the syntax"
  },
  INVALID_NAME: {
    code: "INVALID_NAME",
    status: 422,
    message: "Name can't be empty"
  },
  DAYS_REQUIRED: {
    code: "DAYS_REQUIRED",
    status: 422,
    message: "An event requires at least one day"
  },
  PERIOD_REQUIRED: {
    code: "PERIOD_REQUIRED",
    status: 422,
    message: "A period with a valid start date is required"
  },
  CLAIM_LOGIN_REQUIRED: {
    code: "CLAIM_LOGIN_REQUIRED",
    status: 422,
    message: "You need to log in to claim an event"
  },
  EVENT_NOT_FOUND: {
    code: "EVENT_NOT_FOUND",
    status: 422,
    message: "Event not found"
  },
  EVENT_HAS_OWNER: {
    code: "EVENT_HAS_OWNER",
    status: 422,
    message: "The event already has an owner"
  },
  INVALID_CLAIM: {
    code: "INVALID_CLAIM",
    status: 422,
    message: "Invalid claim token"
  },
  INVALID_EVENT_ID: {
    code: "INVALID_EVENT_ID",
    status: 422,
    message: "Invalid event ID"
  },
  PARTICIPATION_NAME_REQUIRED: {
    code: "PARTICIPATION_NAME_REQUIRED",
    status: 422,
    message: "A name or an user logged in is required to register a participation"
  },
  EVENT_PARTICIPATION_EXPIRED: {
    code: "EVENT_PARTICIPATION_EXPIRED",
    status: 422,
    message: "The time to participate in the event has expired"
  },
  INVALID_EVENT_PASSWORD: {
    code: "INVALID_EVENT_PASSWORD",
    status: 422,
    message: "The password to participate in the event is invalid"
  },
  DAYS_NOT_UNIQUE: {
    code: "DAYS_NOT_UNIQUE",
    status: 422,
    message: "Days must be unique"
  },
  EMPTY_SELECTIONS: {
    code: "EMPTY_SELECTIONS",
    status: 422,
    message: "There must be at least one selection"
  },
  INVALID_SELECTION: {
    code: "INVALID_SELECTION",
    status: 422,
    message: "There is at least one invalid selection. Check that every period has a 'start' attribute"
  },
  INVALID_SELECTION_PERIOD: {
    code: "INVALID_SELECTION_PERIOD",
    status: 422,
    message: "There is at least one selection whose period does not fit to any period of the event"
  },
  INVALID_PARTICIPATION_ID: {
    code: "INVALID_PARTICIPATION_ID",
    status: 422,
    message: "Invalid participation ID"
  },
  AUTHORIZATION_REQUIRED: {
    code: "AUTHORIZATION_REQUIRED",
    status: 422,
    message: "Authorization is required"
  },
  INVALID_SELECTION_ID: {
    code: "INVALID_SELECTION_ID",
    status: 422,
    message: "Invalid selection ID"
  }
};
