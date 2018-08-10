import React from "react";
import PropTypes from "prop-types";
import validator from "validator";
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

function handlePasswordRecovery(props) {
  if(props.captchaVerified && validator.isEmail(props.email)) {
    props.recoverPassword(props.email);
  } else {
    props.badRequest();
  }
}

function passwordRecoveryStatusMessage(props) {
  let success = false;
  let message = "";

  if(props.fail && !props.captchaVerified) {
    success = false;
    message = "verifyCaptcha";
  } else if(props.fail && !props.email) {
    success = false;
    message = "enterYourEmail";
  } else if(props.fail) {
    success = false;
    message = "invalidEmail";
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

const PasswordRecovery = (props) => {
  return (
    <form onSubmit={e => { e.preventDefault(); handlePasswordRecovery(props); }} noValidate>
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
            if(props.fail) {
              props.goodRequest();
            }
          }}
        />

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

      { passwordRecoveryStatusMessage(props) }

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
        <Button disabled={props.recoveryPasswordSent} type="submit" color="primary" variant="contained">
          <Translate value="recover"/>
        </Button>
      </DialogActions>
    </form>
  );
};

PasswordRecovery.propTypes = {
  setEmail: PropTypes.func.isRequired,
  setCaptchaVerified: PropTypes.func.isRequired
};

export default PasswordRecovery;
