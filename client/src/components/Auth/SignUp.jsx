import React from "react";
import PropTypes from "prop-types";
import validator from "validator";
import credentials from "../../config/credentials";
import { LOGIN_SUCCESS, MODE_LOGIN } from "../../state/ducks/auth/types";

import Chip from "@material-ui/core/Chip";
import { Translate } from "react-redux-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import PasswordValidator from "password-validator";
import Recaptcha from "react-recaptcha";

const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase();

function handleSignUp(props) {
  if(props.captchaVerified &&
    props.name &&
    props.surname &&
    validator.isEmail(props.email)
    && props.password &&
    props.password &&
    props.password === props.confirmPassword) {
    props.signUp(props.name, props.surname, props.email, props.password)
      .then(state => {
        if(state.type === LOGIN_SUCCESS) {
          if(props.router.location.pathname === "/login") {
            props.goToUrl("/")
          }
        }
      });
  } else {
    props.badRequest();
  }
}

function signUpStatusMessage(props) {
  let success = false;
  let message = "";

  if(props.fail && !props.captchaVerified) {
    success = false;
    message = "verifyCaptcha";
  } else if(props.fail && props.password !== props.confirmPassword) {
    success = false;
    message = "passwordsDoNotMatch";
  } else if(props.fail &&
    (!props.name || !props.surname || !validator.isEmail(props.email) || !props.password)) {
    success = false;
    message = "checkSignUpFields";
  } else if(props.fail && !passwordSchema.validate(props.password, {})) {
    success = false;
    message = "weakPasswordMessage";
  } else if(props.fail) {
    success = false;
    message = "userAlreadyExists";
  } else if(props.signUpSuccess) {
    success = true;
    message = "signUpSuccessCheckEmail";
  }

  if(message) {
    if(success) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{margin: "10px", background: "#43A047", color: "#fff"}}
            label={<Translate value={message} />}
          />
        </div>
      );
    } else {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{margin: "10px", background: "#D50000", color: "#fff"}}
            label={<Translate value={message} />}
          />
        </div>
      );
    }
  }
}

const SignUp = (props) => {
  return (
    <form onSubmit={e => { e.preventDefault(); handleSignUp(props); }} noValidate>
      <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
        <div style={{width: "100%"}}>
          <TextField
            label={<Translate value="name" />}
            type="text"
            margin="normal"
            style={{marginRight: props.fullScreen ? "0" : "20px"}}
            fullWidth={props.fullScreen}
            required
            value={props.name}
            onChange={event => {
              props.setName(event.target.value);
              if(props.fail) props.goodRequest();
            }}
          />
          <TextField
            label={<Translate value="surname" />}
            type="text"
            style={{}}
            margin="normal"
            fullWidth={props.fullScreen}
            required
            value={props.surname}
            onChange={event => {
              props.setSurname(event.target.value);
              if(props.fail) props.goodRequest();
            }}
          />
        </div>
        <TextField
          label={<Translate value="email" />}
          type="email"
          margin="normal"
          fullWidth
          required
          style={{marginTop: props.fullScreen ? "50px" : "16px"}}
          value={props.email}
          onChange={event => {
            props.setEmail(event.target.value);
            if(props.fail) props.goodRequest();
          }}
        />
        <div>
          <TextField
            label={<Translate value="password" />}
            type="password"
            margin="normal"
            style={{marginRight: props.fullScreen ? "0" : "20px"}}
            fullWidth={props.fullScreen}
            required
            value={props.password}
            onChange={event => {
              props.setPassword(event.target.value);
              if(props.fail) props.goodRequest();
            }}
          />
          <TextField
            label={<Translate value="confirmPassword" />}
            type="password"
            margin="normal"
            fullWidth={props.fullScreen}
            required
            value={props.confirmPassword}
            onChange={event => {
              props.setConfirmPassword(event.target.value);
              if(props.fail) props.goodRequest();
            }}
          />
        </div>

        <div style={{textAlign: "center", marginTop: "8px"}}>
          <Recaptcha
            sitekey={credentials.recaptchaSiteKey}
            verifyCallback={() => {
              props.setCaptchaVerified(true);
              if(props.fail) {
                props.goodRequest();
              }
            }}
            expiredCallback={() => {
              props.setCaptchaVerified(false);
              if(!props.fail) {
                props.badRequest();
              }
            }}
            className="recaptcha"
          />
        </div>
      </DialogContent>

      { signUpStatusMessage(props) }

      <DialogActions>
        <Button
          onClick={() => {
            props.setCaptchaVerified(false);
            props.setMode(MODE_LOGIN);
          }}
          color="secondary"
        >
          <Translate value="return"/>
        </Button>
        <div style={{position: 'relative'}}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={props.loading || props.signUpSuccess}
          >
            <Translate value="createAccount" />
          </Button>
          {props.loading && <CircularProgress className="buttonLoading" size={24} />}
        </div>
      </DialogActions>
    </form>
  );
};

SignUp.propTypes = {
  setName: PropTypes.func.isRequired,
  setSurname: PropTypes.func.isRequired,
  setEmail: PropTypes.func.isRequired,
  setConfirmPassword: PropTypes.func.isRequired,
  setCaptchaVerified: PropTypes.func.isRequired
};

export default SignUp;
