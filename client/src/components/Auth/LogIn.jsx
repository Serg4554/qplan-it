import React  from "react";
import PropTypes from 'prop-types';
import validator from "validator";
import { LOGIN_SUCCESS, MODE_PASSWORD_RECOVERY, MODE_SIGN_UP } from "../../state/ducks/auth/types";

import DialogContent from "@material-ui/core/DialogContent";
import TextField from "@material-ui/core/TextField";
import { Translate } from "react-redux-i18n";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Chip from "@material-ui/core/Chip";

function handleLogin(props) {
  if(props.password && validator.isEmail(props.email)) {
    props.login(props.email, props.password)
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

function loginStatusMessage(props) {
  if(props.fail) {
    return (
      <div style={{textAlign: "center"}}>
        <Chip
          style={{marginTop: "24px", background: "#D50000", color: "#fff"}}
          label={<Translate value="failLoginMessage" />}
        />
      </div>
    );
  }
}

const LogIn = (props) => {
  return (
    <form onSubmit={e => { e.preventDefault(); handleLogin(props); }} noValidate>
      <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
        <TextField
          autoFocus
          label={<Translate value="email" />}
          type="email"
          margin="normal"
          fullWidth
          value={props.email}
          onChange={event => props.setEmail(event.target.value) }
        />
        <TextField
          label={<Translate value="password" />}
          type="password"
          margin="normal"
          fullWidth
          value={props.password}
          onChange={event => props.setPassword(event.target.value) }
        />
      </DialogContent>

      { loginStatusMessage(props) }

      <div style={{textAlign: "center", padding: "24px"}}>
        <a
          style={{textDecoration: "underline", cursor: "pointer"}}
          onClick={() => props.setMode(MODE_PASSWORD_RECOVERY)}
        >
          <Translate value="forgotPasswordQuest" />
        </a>
      </div>

      <DialogActions>
        <Button
          color="secondary"
          variant="contained"
          style={{position: "absolute", left: "4px"}}
          onClick={() => props.setMode(MODE_SIGN_UP)}
        >
          <Translate value="signUp" />
        </Button>
        <Button onClick={() => props.close()} color="secondary">
          <Translate value="close"/>
        </Button>
        <div style={{position: 'relative'}}>
          <Button
            type="submit"
            color="primary"
            variant="contained"
            disabled={props.loading}
          >
            <Translate value="enter" />
          </Button>
          {props.loading && <CircularProgress className="buttonLoading" size={24} />}
        </div>
      </DialogActions>
    </form>
  );
};

LogIn.propTypes = {
  setEmail: PropTypes.func.isRequired,
  setPassword: PropTypes.func.isRequired,
};

export default LogIn;
