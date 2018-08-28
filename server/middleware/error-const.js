module.exports = {
  Error: error => {
    let err = new Error();
    err.code = error.code;
    err.statusCode = error.status;
    err.message = error.message;
    return err;
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
  DAYS_NOT_UNIQUE: {
    code: "DAYS_NOT_UNIQUE",
    status: 422,
    message: "Days must be unique, there are two or more equal days"
  }
};
