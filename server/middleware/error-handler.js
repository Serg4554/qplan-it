const _ = require('lodash');
const ErrorConst = require('./error-const');

function includes(err, code, problem) {
  if(problem.constructor !== Array) {
    problem = [problem];
  }
  const errors = _.get(err.details.codes, code, []);
  return errors.length !== 0 && _.difference(errors, problem).length === 0
}

module.exports = () => (err, req, res, next) => {
  // Set error code
  if(!err.code && err.details) {
    switch(err.details.context) {
      case "user":
        if(includes(err, 'email', "uniqueness")) {
          err.code = ErrorConst.USER_ALREADY_EXISTS.code;
        } else if(includes(err, 'email', ["custom.email", "presence"])) {
          err.code = ErrorConst.INVALID_EMAIL.code;
        } else if(includes(err, 'name', "presence")) {
          err.code = ErrorConst.INVALID_NAME.code;
        }
        break;
      default:
        break;
    }
  }

  // Set error message and status code
  if(_.includes(Object.keys(ErrorConst), err.code, 1)) {
    err.statusCode = ErrorConst[err.code].status;
    err.message = ErrorConst[err.code].message;
  }

  // Set internal server error if no status code is provided
  if(!err.statusCode) {
    err.statusCode = 500;
    if(!err.message) {
      err.message = "Internal Server Error";
    }
  }

  res.status(err.statusCode).send({
    error: {
      code: err.code,
      statusCode: err.statusCode,
      message: err.message
    }
  });
  next(err);
};
