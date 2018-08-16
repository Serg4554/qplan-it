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
    status: 400,
    message: "Password must have at least 8 characters, uppercase and lowercase letters"
  },
  USER_ALREADY_EXISTS: {
    code: "USER_ALREADY_EXISTS",
    status: 400,
    message: "There is already a user with that email"
  },
  INVALID_EMAIL: {
    code: "INVALID_EMAIL",
    status: 400,
    message: "The email is invalid, check the syntax"
  },
  INVALID_NAME: {
    code: "INVALID_NAME",
    status: 400,
    message: "Name can't be empty"
  }
};
