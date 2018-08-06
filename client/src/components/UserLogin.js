import React from "react";
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { LOGIN_SUCCESS, unload, open, login, logout, setFail} from '../reducers/auth'

import theme from '../theme';
import { Translate } from "react-localize-redux";
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import TextField from "@material-ui/core/TextField";

const mapStateToProps = state => {
  return {
    user: state.auth.user,
    opened: state.auth.opened,
    isProgress: state.auth.inProgress,
    fail: state.auth.fail,
    router: state.router
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  unload,
  open,
  login,
  logout,
  setFail,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

const UserLogin = (props) => {
  let location  = props.router.location.pathname;
  let email, password;

  function handleLogin() {
    if(email && password) {
      props.login(email, password)
        .then(state => {
          if(state.type === LOGIN_SUCCESS) {
            if(location === "/login") {
              props.goToUrl("/")
            }
          }
        });
    } else {
      props.setFail();
    }
  }

  return(
    <div className={props.className} style={props.style}>
      <Button
        variant="extendedFab"
        style={{
          backgroundColor: theme.palette.secondary.main,
          color: "white"
        }}
        onClick={() => {
          if(!props.user && location === "/") {
            props.goToUrl("/login")
          }
          if(!props.user) {
            props.open();
          } else {
            props.logout();
          }
        }}
      >
        <PersonIcon style={{marginRight: "10px"}}/>
        {props.user ? props.user.name : <Translate id="login" />}
      </Button>

      <Dialog
        open={!props.user && props.opened}
        onClose={() => {
          props.unload();
          if(location === "/login") {
            props.goToUrl("/")
          }
        }}
        aria-labelledby="login-title">
        <DialogTitle id="login-title"><Translate id="login" /></DialogTitle>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleLogin();
          }}
          noValidate
        >
          <DialogContent style={{textAlign: "center", maxWidth: "400px"}}>
            <TextField
              autoFocus
              id="login"
              label={<Translate id="email" />}
              type="email"
              margin="normal"
              fullWidth
              onChange={event => email = event.target.value}
            />
            <TextField
              id="password"
              label={<Translate id="password" />}
              type="password"
              margin="normal"
              fullWidth
              onChange={event => password = event.target.value}
            />
          </DialogContent>
          <div style={{textAlign: "center"}}>
            {props.fail && <Chip style={{marginBottom: "20px", background: "#D50000", color: "#fff"}} label={<Translate id="failLoginMessage" />} />}
          </div>
          <DialogActions>
            <Button color="secondary">
              <Translate id="signUp" />
            </Button>
            <div style={{position: 'relative'}}>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                disabled={props.isProgress}
              >
                <Translate id="enter" />
              </Button>
              {props.isProgress && <CircularProgress className="buttonLoading" size={24} />}
            </div>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

UserLogin.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default connect(mapStateToProps, mapDispatchToProps)(UserLogin);
