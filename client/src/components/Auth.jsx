import React from "react";
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { MODE_LOGIN, MODE_PASSWORD_RECOVERY, LOGIN_SUCCESS } from '../state/ducks/auth/types'
import { open, close, setMode, login, logout, badRequest, recoverPassword } from '../state/ducks/auth/operations'

import theme from '../config/theme';
import { Translate } from 'react-redux-i18n';
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import CircularProgress from '@material-ui/core/CircularProgress';
import Chip from '@material-ui/core/Chip';
import TextField from "@material-ui/core/TextField";

const mapStateToProps = state => {
  return {
    mode: state.auth.mode,
    opened: state.auth.opened || false,
    loading: state.auth.loading || false,
    fail: state.auth.fail || false,
    recoveryPasswordSent: state.auth.recoveryPasswordSent || false,

    user: state.session.user,
    router: state.router
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  open,
  close,
  setMode,
  login,
  logout,
  badRequest,
  recoverPassword,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class Auth extends React.Component {
  componentWillReceiveProps(nextProps, nextContext) {
    if(this.props.opened !== nextProps.opened) {
      this.setState({ email: "", password: "" });
      if(this.props.router.location.pathname === "/login") {
        this.props.goToUrl("/")
      }
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: ""
    };
  }

  handleLogin() {
    if(this.state.email && this.state.password) {
      this.props.login(this.state.email, this.state.password)
        .then(state => {
          if(state.type === LOGIN_SUCCESS) {
            if(this.props.router.location.pathname === "/login") {
              this.props.goToUrl("/")
            }
          }
        });
    } else {
      this.props.badRequest();
    }
  }

  handlePasswordRecovery() {
    if(this.state.email) {
      this.props.recoverPassword(this.state.email);
    } else {
      this.props.badRequest();
    }
  }

  loginStatusMessage() {
    if(this.props.fail) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip style={{marginTop: "24px", background: "#D50000", color: "#fff"}} label={<Translate value="failLoginMessage" />} />
        </div>
      );
    }
  }

  passwordRecoveryStatusMessage() {
    if(this.props.fail) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip style={{marginTop: "24px", background: "#D50000", color: "#fff"}} label={<Translate value="invalidEmail" />} />
        </div>
      );
    } else if(this.props.recoveryPasswordSent) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip style={{marginTop: "24px", background: "#43A047", color: "#fff"}} label={<Translate value="recoveryPasswordEmailSent" />} />
        </div>
      );
    }
  }

  renderLogin() {
    return (
      <form id={1} onSubmit={e => { e.preventDefault(); this.handleLogin(); }} noValidate>
        <DialogContent style={{padding: "0 24px", textAlign: "center", maxWidth: "400px"}}>
          <TextField
            autoFocus
            key="login"
            label={<Translate value="email" />}
            type="email"
            margin="normal"
            fullWidth
            value={this.state.email}
            onChange={event => this.setState({ email: event.target.value }) }
          />
          <TextField
            key="password"
            label={<Translate value="password" />}
            type="password"
            margin="normal"
            fullWidth
            value={this.state.password}
            onChange={event => this.setState({ password: event.target.value }) }
          />
        </DialogContent>

        { this.loginStatusMessage() }

        <div style={{textAlign: "center", padding: "24px"}}>
          <a style={{textDecoration: "underline", cursor: "pointer"}} onClick={() => this.props.setMode(MODE_PASSWORD_RECOVERY)}>
            <Translate value="forgotPasswordQuest" />
          </a>
        </div>

        <DialogActions>
          <Button color="secondary" variant="contained" style={{position: "absolute", left: "4px"}}>
            <Translate value="signUp" />
          </Button>
          <Button onClick={() => this.props.close()} color="secondary">
            <Translate value="close"/>
          </Button>
          <div style={{position: 'relative'}}>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={this.props.loading}
            >
              <Translate value="enter" />
            </Button>
            {this.props.loading && <CircularProgress className="buttonLoading" size={24} />}
          </div>
        </DialogActions>
      </form>
    );
  }

  renderPasswordRecovery() {
    return (
      <form onSubmit={e => { e.preventDefault(); this.handlePasswordRecovery(); }} noValidate>
        <DialogContent style={{padding: "0 24px", textAlign: "center", maxWidth: "400px"}}>
          <DialogContentText style={{textAlign: "left"}}>
            <Translate value="passwordRecoveryMessage" />
          </DialogContentText>

          <TextField
            autoFocus
            key="recoverEmail"
            label={<Translate value="email" />}
            type="email"
            margin="normal"
            fullWidth
            value={this.state.email}
            onChange={event => this.setState({ email: event.target.value }) }
          />
        </DialogContent>

        { this.passwordRecoveryStatusMessage() }

        <DialogActions>
          <Button onClick={() => this.props.setMode(MODE_LOGIN)} color="secondary">
            <Translate value="return"/>
          </Button>
          <Button type="submit" color="primary" variant="contained">
            <Translate value="recover"/>
          </Button>
        </DialogActions>
      </form>
    );
  }

  render() {
    return (
      <div className={this.props.className} style={this.props.style}>
        <Button
          variant="extendedFab"
          style={{
            backgroundColor: theme.palette.secondary.main,
            color: "white"
          }}
          onClick={() => {
            if(!this.props.user && this.props.router.location.pathname === "/") {
              this.props.goToUrl("/login")
            }
            if(!this.props.user) {
              this.props.open();
            } else {
              this.props.logout();
            }
          }}
        >
          <PersonIcon style={{marginRight: "10px"}}/>
          {this.props.user ? this.props.user.name : <Translate value="login" />}
        </Button>

        <Dialog
          open={!this.props.user && this.props.opened}
          onClose={() => this.props.close()}
          aria-labelledby="login-title">
          <DialogTitle id="login-title">
            <Translate
              value={this.props.mode === MODE_LOGIN ?
                "login" :
                (this.props.mode === MODE_PASSWORD_RECOVERY ?
                  "recoverPassword" :
                  "signUp")}/>
          </DialogTitle>
          {this.props.mode === "LOGIN" ? this.renderLogin() : this.renderPasswordRecovery()}
        </Dialog>
      </div>
    );
  }
}

Auth.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object
};

export default connect(mapStateToProps, mapDispatchToProps)(Auth);
