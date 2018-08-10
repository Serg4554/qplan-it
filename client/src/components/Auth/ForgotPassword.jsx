import React from "react";
import PropTypes from "prop-types";
import {MODE_LOGIN} from "../../state/ducks/auth/types";
import credentials from "../../config/credentials";

import Chip from "@material-ui/core/Chip";
import { Translate } from "react-redux-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import Recaptcha from "react-recaptcha";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

function forgotPasswordStatusMessage(props) {
  let success = false;
  let message = "";

  if(props.showCaptchaAlert) {
    success = false;
    message = "verifyCaptcha";
  } else if(props.error && props.error.code === "EMAIL_NOT_FOUND") {
    success = false;
    message = "emailNotFound";
  } else if(props.recoveryPasswordSent) {
    success = true;
    message = "recoveryPasswordEmailSent";
  }

  if(message) {
    if(success) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginTop: "10px", background: "#43A047", color: "#fff"}}
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

const ForgotPassword = (props) => {
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if(!props.captchaVerified) {
          props.setCaptchaVerified(false);
        } else {
          props.recoverPassword(props.email);
        }
      }}
      noValidate
    >
      <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
        <DialogContentText style={{textAlign: "left", maxWidth: props.fullScreen ? "initial" : "400px"}}>
          <Translate value="passwordRecoveryMessage" />
        </DialogContentText>

        <TextField
          autoFocus
          label={<Translate value="email" />}
          type="email"
          margin="normal"
          fullWidth
          value={props.email}
          onChange={event => {
            props.setEmail(event.target.value);
            if(props.error) {
              props.cleanError();
            }
          }}
        />

        <div style={{textAlign: "center", marginTop: "8px", display: props.recoveryPasswordSent ? "none" : "inherit"}}>
          <Recaptcha
            sitekey={credentials.recaptchaSiteKey}
            verifyCallback={() => props.setCaptchaVerified(true)}
            expiredCallback={() => {
              if(!props.recoveryPasswordSent) {
                props.setCaptchaVerified(false)
              }
            }}
            className="recaptcha"
          />
        </div>
      </DialogContent>

      { forgotPasswordStatusMessage(props) }

      <DialogActions>
        <Button
          onClick={() => props.setMode(MODE_LOGIN)}
          color="secondary"
        >
          <Translate value="return"/>
        </Button>
        <Button disabled={props.recoveryPasswordSent} type="submit" color="primary" variant="contained">
          <Translate value="recover"/>
        </Button>
      </DialogActions>
    </form>
  );
};

ForgotPassword.propTypes = {
  setEmail: PropTypes.func.isRequired,
  setCaptchaVerified: PropTypes.func.isRequired
};

export default ForgotPassword;
