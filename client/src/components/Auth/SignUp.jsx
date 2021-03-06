import React from "react";
import PropTypes from "prop-types";
import credentials from "../../config/credentials";
import { MODE_LOGIN } from "../../state/ducks/auth/types";

import Chip from "@material-ui/core/Chip";
import { Translate } from "react-redux-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Recaptcha from "react-recaptcha";


const SignUp = (props) => {
  let recaptchaInstance;

  function signUpStatusMessage() {
    let success = false;
    let message = "";

    if(props.alertPasswordNotMatch) {
      success = false;
      message = "auth.message.passwordsDoNotMatch";
    } else if(props.error && props.error.code === "INVALID_CAPTCHA") {
      success = false;
      message = "auth.message.verifyCaptcha";
    } else if(props.error && props.error.code === "PASSWORD_TOO_WEAK") {
      success = false;
      message = "auth.message.weakPassword";
    } else if(props.error && props.error.code === "INVALID_EMAIL") {
      success = false;
      message = "auth.message.invalidEmail";
    } else if (props.error && props.error.code === "INVALID_NAME") {
      success = false;
      message = "auth.message.invalidName";
    } else if(props.error && props.error.code === "USER_ALREADY_EXISTS") {
      success = false;
      message = "auth.message.userAlreadyExists";
    } else if(props.error) {
      success = false;
      message = "auth.message.errorOccurred";
    } else if(props.signUpSuccess) {
      success = true;
      message = "auth.message.signUpSuccessCheckEmail";
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

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        const passwordNotMatch = props.password !== props.confirmPassword;
        props.setAlertPasswordNotMatch(passwordNotMatch);

        if(!passwordNotMatch) {
          props.signUp(props.name, props.surname, props.email, props.password, props.captchaToken);
          recaptchaInstance.reset();
          props.setCaptchaToken(null);
        }
      }}
      noValidate
    >
      <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
        <div style={{width: "100%"}}>
          <TextField
            label={<Translate value="auth.name" />}
            type="text"
            margin="normal"
            style={{marginRight: props.fullScreen ? "0" : "20px"}}
            fullWidth={props.fullScreen}
            required
            value={props.name}
            onChange={event => {
              props.setName(event.target.value);
              if(props.error) {
                props.cleanError();
              }
            }}
          />
          <TextField
            label={<Translate value="auth.surname" />}
            type="text"
            style={{}}
            margin="normal"
            fullWidth={props.fullScreen}
            value={props.surname}
            onChange={event => {
              props.setSurname(event.target.value);
              if(props.error) {
                props.cleanError();
              }
            }}
          />
        </div>
        <TextField
          label={<Translate value="auth.email" />}
          type="email"
          margin="normal"
          fullWidth
          required
          style={{marginTop: props.fullScreen ? "50px" : "16px"}}
          value={props.email}
          onChange={event => {
            props.setEmail(event.target.value);
            if(props.error) {
              props.cleanError();
            }
          }}
        />
        <div>
          <TextField
            label={<Translate value="auth.password" />}
            type="password"
            margin="normal"
            style={{marginRight: props.fullScreen ? "0" : "20px"}}
            fullWidth={props.fullScreen}
            required
            value={props.password}
            onChange={event => {
              props.setPassword(event.target.value);
              if(props.error) {
                props.cleanError();
              }
            }}
          />
          <TextField
            label={<Translate value="auth.confirmPassword" />}
            type="password"
            margin="normal"
            fullWidth={props.fullScreen}
            required
            value={props.confirmPassword}
            onChange={event => {
              props.setConfirmPassword(event.target.value);
              if(props.error) {
                props.cleanError();
              }
            }}
          />
        </div>

        <div style={{textAlign: "center", marginTop: "8px", display: props.signUpSuccess ? "none" : "inherit"}}>
          <Recaptcha
            ref={obj => recaptchaInstance = obj}
            sitekey={credentials.visibleCaptchaKey}
            verifyCallback={token => props.setCaptchaToken(token)}
            expiredCallback={() => props.setCaptchaToken(null)}
            className="recaptcha"
          />
        </div>
      </DialogContent>

      { signUpStatusMessage() }

      <DialogActions>
        <Button
          onClick={() => props.setMode(MODE_LOGIN)}
          color="secondary"
        >
          <Translate value="common.return"/>
        </Button>
        <div style={{position: 'relative'}}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={props.loading || props.signUpSuccess}
          >
            <Translate value="auth.createAccount" />
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
  setAlertPasswordNotMatch: PropTypes.func.isRequired,
  setCaptchaToken: PropTypes.func.isRequired
};

export default SignUp;
