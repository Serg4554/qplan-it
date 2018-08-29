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

const ForgotPassword = (props) => {
  let recaptchaInstance;

  function forgotPasswordStatusMessage() {
    let success = false;
    let message = "";

    if(props.error && props.error.code === "INVALID_CAPTCHA") {
      success = false;
      message = "auth.message.verifyCaptcha";
    } else if(props.error && props.error.code === "EMAIL_NOT_FOUND") {
      success = false;
      message = "auth.message.emailNotFound";
    } else if(props.error && props.error.code === "RESET_FAILED_EMAIL_NOT_VERIFIED") {
      success = false;
      message = "auth.message.emailNotVerified";
    } else if(props.error) {
      success = false;
      message = "auth.message.errorOccurred";
    } else if(props.recoveryPasswordSent) {
      success = true;
      message = "auth.message.recoveryPasswordEmailSent";
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

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        props.recoverPassword(props.email, props.captchaToken);
        recaptchaInstance.reset();
        props.setCaptchaToken(null);
      }}
      noValidate
    >
      <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
        <DialogContentText style={{textAlign: "left", maxWidth: props.fullScreen ? "initial" : "400px"}}>
          <Translate value="auth.passwordRecoveryHeader" />
        </DialogContentText>

        <TextField
          autoFocus
          label={<Translate value="auth.email" />}
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
            ref={obj => recaptchaInstance = obj}
            sitekey={credentials.visibleCaptchaKey}
            verifyCallback={token => props.setCaptchaToken(token)}
            expiredCallback={() => props.setCaptchaToken(null)}
            className="recaptcha"
          />
        </div>
      </DialogContent>

      { forgotPasswordStatusMessage() }

      <DialogActions>
        <Button
          onClick={() => props.setMode(MODE_LOGIN)}
          color="secondary"
        >
          <Translate value="common.return"/>
        </Button>
        <Button disabled={props.recoveryPasswordSent} type="submit" color="primary" variant="contained">
          <Translate value="auth.recover"/>
        </Button>
      </DialogActions>
    </form>
  );
};

ForgotPassword.propTypes = {
  setEmail: PropTypes.func.isRequired,
  setCaptchaToken: PropTypes.func.isRequired
};

export default ForgotPassword;
