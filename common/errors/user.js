'use strict';

function newError(data) {
  let err = new Error(data.message);
  err.statusCode = data.status;
  err.code = data.code;
  return err;
}

module.exports = {
  PASSWORD_TOO_WEAK: newError({
    code: "PASSWORD_TOO_WEAK",
    status: 400,
    message: "Password must have at least 8 characters, uppercase and lowercase letters"
  }),
  INVALID_EMAIL: newError({
    code: "INVALID_EMAIL",
    status: 400,
    message: "Invalid email"
  })
};
