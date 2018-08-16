import React from "react";
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from 'connected-react-router'
import { MODE_LOGIN, MODE_PASSWORD_RECOVERY, MODE_SIGN_UP } from '../../state/ducks/auth/types'
import * as AuthOperations from '../../state/ducks/auth/operations';

import theme from '../../config/theme';
import { Translate } from 'react-redux-i18n';
import PersonIcon from '@material-ui/icons/Person';
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import withMobileDialog from '@material-ui/core/withMobileDialog';
import LogIn from "./LogIn"
import SignUp from "./SignUp"
import ForgotPassword from "./ForgotPassword"

const mapStateToProps = state => {
  /** @namespace state.auth */
  /** @namespace state.session */
  return {
    mode: state.auth.mode,
    opened: state.auth.opened || false,
    loading: state.auth.loading || false,
    error: state.auth.error,
    recoveryPasswordSent: state.auth.recoveryPasswordSent || false,
    signUpSuccess: state.auth.signUpSuccess || false,
    user: state.session.user,
    router: state.router
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  open: AuthOperations.open,
  close: AuthOperations.close,
  setMode: AuthOperations.setMode,
  cleanError: AuthOperations.cleanError,
  login: AuthOperations.login,
  logout: AuthOperations.logout,
  recoverPassword: AuthOperations.recoverPassword,
  signUp: AuthOperations.signUp,
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
  alertPasswordNotMatch: false,
  captchaVerified: false,
  showCaptchaAlert: false
};

class Index extends React.Component {
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

    if(location === "/login" && nextLocation !== "/login") {
      this.props.close();
    } else if(!nextProps.opened && nextLocation === "/login") {
      this.props.open();
    }
  }

  renderContent() {
    const logIn = (
      <LogIn
        {...this.state}
        {...this.props}
        setEmail={email => this.setState({ email })}
        setPassword={password => this.setState({ password })}
        onModeChange={() => {
          if(this.props.error) {
            this.props.cleanError();
          }
          this.setState({ captchaVerified: false, showCaptchaAlert: false });
        }}
      />
    );

    const signUp = (
      <SignUp
        {...this.state}
        {...this.props}
        setName={name => this.setState({ name })}
        setSurname={surname => this.setState({ surname })}
        setEmail={email => this.setState({ email })}
        setPassword={password => this.setState({ password })}
        setConfirmPassword={confirmPassword => this.setState({ confirmPassword })}
        setAlertPasswordNotMatch={alertPasswordNotMatch => this.setState({ alertPasswordNotMatch })}
        setCaptchaVerified={captchaVerified => {
          if(captchaVerified && this.props.error) {
            this.props.cleanError();
          }
          if(!this.props.signUpSuccess) {
            this.setState({ captchaVerified, showCaptchaAlert: !captchaVerified });
          }
        }}
      />
    );

    const passwordRecovery = (
      <ForgotPassword
        {...this.state}
        {...this.props}
        setEmail={email => this.setState({ email })}
        setCaptchaVerified={captchaVerified => {
          if(captchaVerified && this.props.error) {
            this.props.cleanError();
          }
          if(!this.props.recoveryPasswordSent) {
            this.setState({ captchaVerified, showCaptchaAlert: !captchaVerified });
          }
        }}
      />
    );

    switch (this.props.mode) {
      case MODE_LOGIN: return logIn;
      case MODE_SIGN_UP: return signUp;
      case MODE_PASSWORD_RECOVERY: return passwordRecovery;
      default: return logIn;
    }
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
          {this.props.user ? this.props.user.name : <Translate value="auth.login" />}
        </Button>

        <Dialog
          open={!this.props.user && this.props.opened}
          onClose={() => this.props.close()}
          fullScreen={this.props.fullScreen}
          aria-labelledby="login-title">
          <DialogTitle id="login-title">
            <Translate
              value={this.props.mode === MODE_LOGIN ? "auth.login" :
                (this.props.mode === MODE_SIGN_UP ? "auth.signUp" :
                  (this.props.mode === MODE_PASSWORD_RECOVERY ? "auth.recoverPassword" : "auth.login"))}/>
          </DialogTitle>
          { this.renderContent() }
        </Dialog>
      </div>
    );
  }
}

Index.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,

  mode: PropTypes.string,
  opened: PropTypes.bool,
  loading: PropTypes.bool,
  error: PropTypes.object,
  recoveryPasswordSent: PropTypes.bool,
  user: PropTypes.object,
  router: PropTypes.object,

  open: PropTypes.func,
  close: PropTypes.func,
  setMode: PropTypes.func,
  cleanError: PropTypes.func,
  login: PropTypes.func,
  logout: PropTypes.func,
  signUp: PropTypes.func,
  recoverPassword: PropTypes.func,
  goToUrl: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(withMobileDialog()(Index));
