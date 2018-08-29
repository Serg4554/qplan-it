import React  from "react";
import PropTypes from 'prop-types';
import { MODE_PASSWORD_RECOVERY, MODE_SIGN_UP } from "../../state/ducks/auth/types";

import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { Translate } from "react-redux-i18n";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Chip from "@material-ui/core/Chip";

const LogIn = (props) => {
  function handleLogin() {
    props.login(props.email, props.password)
      .then(() => {
        if(!props.open && props.router.location.pathname === "/login") {
          props.goToUrl("/")
        }
      });
  }

  function loginStatusMessage() {
    if(props.error) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginTop: "24px", background: "#D50000", color: "#fff"}}
            label={<Translate value="auth.message.failLogin" />}
          />
        </div>
      );
    }
  }

  return (
    <form onSubmit={e => { e.preventDefault(); handleLogin(); }} noValidate>
      <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
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
        <TextField
          label={<Translate value="auth.password" />}
          type="password"
          margin="normal"
          fullWidth
          value={props.password}
          onChange={event => {
            props.setPassword(event.target.value);
            if(props.error) {
              props.cleanError();
            }
          }}
        />
      </DialogContent>

      { loginStatusMessage() }

      <div style={{textAlign: "center", padding: "24px"}}>
        <a
          style={{textDecoration: "underline", cursor: "pointer"}}
          onClick={() => {
            props.setMode(MODE_PASSWORD_RECOVERY);
            if(props.onModeChange) {
              props.onModeChange();
            }
          }}
        >
          <Translate value="auth.forgotPasswordQuest" />
        </a>
      </div>

      <DialogActions>
        <Button
          color="secondary"
          variant="contained"
          style={{position: "absolute", left: "4px"}}
          onClick={() => {
            props.setMode(MODE_SIGN_UP);
            if(props.onModeChange) {
              props.onModeChange();
            }
          }}
        >
          <Translate value="auth.signUp" />
        </Button>
        <Button onClick={() => props.onClose()} color="secondary">
          <Translate value="common.close"/>
        </Button>
        <div style={{position: 'relative'}}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={props.loading}
          >
            <Translate value="common.enter" />
          </Button>
          {props.loading && <CircularProgress className="buttonLoading" size={24} />}
        </div>
      </DialogActions>
    </form>
  );
};

LogIn.propTypes = {
  onClose: PropTypes.func.isRequired,
  setEmail: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
  onModeChange: PropTypes.func
};

export default LogIn;
