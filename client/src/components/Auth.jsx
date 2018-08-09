import React from "react";
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { MODE_LOGIN, MODE_PASSWORD_RECOVERY, MODE_SIGN_UP, LOGIN_SUCCESS } from '../state/ducks/auth/types'
import {
  open, close, setMode, login, logout, badRequest, goodRequest, recoverPassword, signUp
} from '../state/ducks/auth/operations'
import validator from "validator";
import PasswordValidator from 'password-validator';
import credentials from '../config/credentials.json';

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
import withMobileDialog from '@material-ui/core/withMobileDialog';
import Recaptcha from 'react-recaptcha';

const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase();

const mapStateToProps = state => {
  return {
    mode: state.auth.mode,
    opened: state.auth.opened || false,
    loading: state.auth.loading || false,
    fail: state.auth.fail || false,
    recoveryPasswordSent: state.auth.recoveryPasswordSent || false,
    signUpSuccess: state.auth.signUpSuccess || false,
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
  goodRequest,
  recoverPassword,
  signUp,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

const initialState = {
  name: "",
  surname: "",
  email: "",
  password: "",
  confirmPassword: "",
  captchaVerified: false
};

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = initialState;
  }

  componentWillMount() {
    const logged = !!this.props.user;
    if(this.props.router.location.pathname === "/login") {
      if(logged) {
        this.props.goToUrl("/");
      } else {
        this.props.open();
      }
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const location = this.props.router.location.pathname;
    const nextLocation = nextProps.router.location.pathname;

    if(this.props.opened !== nextProps.opened) {
      this.setState(initialState);
      if(!nextProps.opened && location === "/login" && nextLocation === "/login") {
        this.props.goToUrl("/")
      }
    }

    if(this.props.router.location.pathname === "/login" && nextLocation === "/") {
      this.props.close();
    } else if(!nextProps.opened && location === "/" && nextLocation === "/login") {
      this.props.open();
    }
  }

  handleLogin() {
    if(this.state.password && validator.isEmail(this.state.email)) {
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
    if(validator.isEmail(this.state.email)) {
      this.props.recoverPassword(this.state.email);
    } else {
      this.props.badRequest();
    }
  }

  handleSignUp() {
    if(this.state.captchaVerified &&
      this.state.name &&
      this.state.surname &&
      validator.isEmail(this.state.email)
      && this.state.password &&
      this.state.password &&
      this.state.password === this.state.confirmPassword) {
      this.props.signUp(this.state.name, this.state.surname, this.state.email, this.state.password)
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

  loginStatusMessage() {
    if(this.props.fail) {
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

  passwordRecoveryStatusMessage() {
    let success = false;
    let message = "";

    if(this.props.fail && !this.state.captchaVerified) {
      success = false;
      message = "verifyCaptcha";
    } else if(this.props.fail && !this.state.email) {
      success = false;
      message = "enterYourEmail";
    } else if(this.props.fail) {
      success = false;
      message = "invalidEmail";
    } else if(this.props.recoveryPasswordSent) {
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

  signUpStatusMessage() {
    let success = false;
    let message = "";

    if(this.props.fail && !this.state.captchaVerified) {
      success = false;
      message = "verifyCaptcha";
    } else if(this.props.fail && this.state.password !== this.state.confirmPassword) {
      success = false;
      message = "passwordsDoNotMatch";
    } else if(this.props.fail &&
      (!this.state.name || !this.state.surname || !validator.isEmail(this.state.email) || !this.state.password)) {
      success = false;
      message = "checkSignUpFields";
    } else if(this.props.fail && !passwordSchema.validate(this.state.password, {})) {
      success = false;
      message = "weakPasswordMessage";
    } else if(this.props.fail) {
      success = false;
      message = "userAlreadyExists";
    } else if(this.props.signUpSuccess) {
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

  renderCaptcha() {
    return (
      <div style={{textAlign: "center", marginTop: "8px"}}>
        <Recaptcha
          sitekey={credentials.recaptchaSiteKey}
          verifyCallback={() => {
            this.setState({ captchaVerified: true });
            if(this.props.fail) {
              this.props.goodRequest();
            }
          }}
          expiredCallback={() => {
            this.setState({ captchaVerified: false });
            if(!this.props.fail) {
              this.props.badRequest();
            }
          }}
          className="recaptcha"
        />
      </div>
    );
  }

  renderLogin() {
    return (
      <form onSubmit={e => { e.preventDefault(); this.handleLogin(); }} noValidate>
        <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
          <TextField
            autoFocus
            label={<Translate value="email" />}
            type="email"
            margin="normal"
            fullWidth
            value={this.state.email}
            onChange={event => this.setState({ email: event.target.value }) }
          />
          <TextField
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
          <a
            style={{textDecoration: "underline", cursor: "pointer"}}
            onClick={() => this.props.setMode(MODE_PASSWORD_RECOVERY)}
          >
            <Translate value="forgotPasswordQuest" />
          </a>
        </div>

        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            style={{position: "absolute", left: "4px"}}
            onClick={() => this.props.setMode(MODE_SIGN_UP)}
          >
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
        <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
          <DialogContentText style={{textAlign: "left", maxWidth: this.props.fullScreen ? "initial" : "400px"}}>
            <Translate value="passwordRecoveryMessage" />
          </DialogContentText>

          <TextField
            autoFocus
            label={<Translate value="email" />}
            type="email"
            margin="normal"
            fullWidth
            value={this.state.email}
            onChange={event => {
              this.setState({ email: event.target.value });
              if(this.props.fail) {
                this.props.goodRequest();
              }
            }}
          />
          { this.renderCaptcha() }
        </DialogContent>

        { this.passwordRecoveryStatusMessage() }

        <DialogActions>
          <Button
            onClick={() => {
              this.setState({captchaVerified: false});
              this.props.setMode(MODE_LOGIN);
            }}
            color="secondary"
          >
            <Translate value="return"/>
          </Button>
          <Button disabled={this.props.recoveryPasswordSent} type="submit" color="primary" variant="contained">
            <Translate value="recover"/>
          </Button>
        </DialogActions>
      </form>
    );
  }

  renderSignUp() {
    return (
      <form onSubmit={e => { e.preventDefault(); this.handleSignUp(); }} noValidate>
        <DialogContent style={{padding: "0 24px", textAlign: "center"}}>
          <div style={{width: "100%"}}>
            <TextField
              label={<Translate value="name" />}
              type="text"
              margin="normal"
              style={{marginRight: this.props.fullScreen ? "0" : "20px"}}
              fullWidth={this.props.fullScreen}
              required
              value={this.state.name}
              onChange={event => {
                this.setState({ name: event.target.value });
                if(this.props.fail) this.props.goodRequest();
              }}
            />
            <TextField
              label={<Translate value="surname" />}
              type="text"
              style={{}}
              margin="normal"
              fullWidth={this.props.fullScreen}
              required
              value={this.state.surname}
              onChange={event => {
                this.setState({ surname: event.target.value });
                if(this.props.fail) this.props.goodRequest();
              }}
            />
          </div>
          <TextField
            label={<Translate value="email" />}
            type="email"
            margin="normal"
            fullWidth
            required
            style={{marginTop: this.props.fullScreen ? "50px" : "16px"}}
            value={this.state.email}
            onChange={event => {
              this.setState({ email: event.target.value });
              if(this.props.fail) this.props.goodRequest();
            }}
          />
          <div>
            <TextField
              label={<Translate value="password" />}
              type="password"
              margin="normal"
              style={{marginRight: this.props.fullScreen ? "0" : "20px"}}
              fullWidth={this.props.fullScreen}
              required
              value={this.state.password}
              onChange={event => {
                this.setState({ password: event.target.value });
                if(this.props.fail) this.props.goodRequest();
              }}
            />
            <TextField
              label={<Translate value="confirmPassword" />}
              type="password"
              margin="normal"
              fullWidth={this.props.fullScreen}
              required
              value={this.state.confirmPassword}
              onChange={event => {
                this.setState({ confirmPassword: event.target.value });
                if(this.props.fail) this.props.goodRequest();
              }}
            />
          </div>
          { this.renderCaptcha() }
        </DialogContent>

        { this.signUpStatusMessage() }

        <DialogActions>
          <Button
            onClick={() => {
              this.setState({captchaVerified: false});
              this.props.setMode(MODE_LOGIN);
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
              disabled={this.props.loading || this.props.signUpSuccess}
            >
              <Translate value="createAccount" />
            </Button>
            {this.props.loading && <CircularProgress className="buttonLoading" size={24} />}
          </div>
        </DialogActions>
      </form>
    );
  }

  renderContent() {
    switch (this.props.mode) {
      case MODE_LOGIN:
        return this.renderLogin();
      case MODE_SIGN_UP:
        return this.renderSignUp();
      case MODE_PASSWORD_RECOVERY:
        return this.renderPasswordRecovery();
      default:
        return this.renderLogin();
    }
  }

  render() {
    console.log(this.state);
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
          fullScreen={this.props.fullScreen}
          aria-labelledby="login-title">
          <DialogTitle id="login-title">
            <Translate
              value={this.props.mode === MODE_LOGIN ? "login" :
                (this.props.mode === MODE_SIGN_UP ? "signUp" : "recoverPassword")}/>
          </DialogTitle>
          { this.renderContent() }
        </Dialog>
      </div>
    );
  }
}

Auth.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,

  mode: PropTypes.string,
  opened: PropTypes.bool,
  loading: PropTypes.bool,
  fail: PropTypes.bool,
  recoveryPasswordSent: PropTypes.bool,
  user: PropTypes.object,
  router: PropTypes.object,

  open: PropTypes.func,
  close: PropTypes.func,
  setMode: PropTypes.func,
  login: PropTypes.func,
  logout: PropTypes.func,
  badRequest: PropTypes.func,
  goodRequest: PropTypes.func,
  signUp: PropTypes.func,
  recoverPassword: PropTypes.func,
  goToUrl: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(withMobileDialog()(Auth));
