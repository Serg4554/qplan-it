import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import { isValidToken, changeLostPassword, cleanError, close } from "../state/ducks/passwordRecovery/operations"
import { login } from "../state/ducks/auth/operations"

import Chip from "@material-ui/core/Chip";
import { Translate } from "react-redux-i18n";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";


const mapStateToProps = state => {
  /** @namespace state.passwordRecovery */
  return {
    email: state.passwordRecovery.email,
    loading: state.passwordRecovery.loading,
    success: state.passwordRecovery.success,
    error: state.passwordRecovery.error,
    router: state.router
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  isValidToken,
  changeLostPassword,
  login,
  cleanError,
  close,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class PasswordRecovery extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
      confirmPassword: "",
      alertPasswordNotMatch: false,
      redirectProgress: 0
    };

    const params = new URLSearchParams(props.router.location.search);
    this.userId = params.has("usr") ? params.get("usr") : null;
    this.token = params.has("jwt") ? params.get("jwt") : null;

    if (!this.token || !this.userId) {
      props.goToUrl("/");
    } else {
      props.isValidToken(this.userId, this.token);
    }
  }

  componentWillUnmount() {
    if(this.progress) {
      clearInterval(this.progress);
    }
    if(this.timeout) {
      clearTimeout(this.timeout);
    }
    this.props.close();
  }

  success() {
    this.progress = setInterval(() => this.setState({ redirectProgress: this.state.redirectProgress + 15 }), 200);

    const that = this;
    this.timeout = setTimeout(function () {
      clearInterval(that.progress);
      that.props.goToUrl("/");
    }, 2000);
  }

  handleChangePassword() {
    this.props.changeLostPassword(this.state.password, this.token)
      .then(() => {
        if(this.props.success) {
          this.props.login(this.props.email, this.state.password)
            .then(() => this.success())
        }
      });
  }

  statusMessage() {
    let success = false;
    let message = "";

    if(this.state.alertPasswordNotMatch) {
      success = false;
      message = "auth.message.passwordsDoNotMatch";
    } else if(this.props.error && this.props.error.code === "PASSWORD_TOO_WEAK") {
      success = false;
      message = "auth.message.weakPassword";
    } else if(this.props.error && this.props.error.code === "AUTHORIZATION_REQUIRED") {
      success = false;
      message = "auth.message.expiredLink";
    } else if(this.props.error) {
      success = false;
      message = "auth.message.invalidPassword";
    } else if(this.props.success) {
      success = true;
      message = "auth.message.passwordSuccessfullyChanged";
    }

    if(message) {
      if(success) {
        return (
          <div style={{textAlign: "center"}}>
            <Chip
              style={{background: "#43A047", color: "#fff"}}
              label={<Translate value={message} />}
            />
            <LinearProgress
              style={{marginTop: "20px"}}
              color="secondary"
              variant="determinate"
              value={this.state.redirectProgress}
            />
          </div>
        );
      } else {
        return (
          <div style={{textAlign: "center"}}>
            <Chip
              style={{background: "#D50000", color: "#fff"}}
              label={<Translate value={message} />}
            />
          </div>
        );
      }
    }
  }

  isFormDisabled() {
    return (this.props.error && this.props.error.code === "AUTHORIZATION_REQUIRED") ||
      this.props.loading ||
      this.props.success;
  }

  render() {
    return (
      <div>
        <div style={{maxWidth: "500px", margin: "0 auto", textAlign: "center"}}>
          <form
            onSubmit={e => {
              e.preventDefault();
              const alertPasswordNotMatch = this.state.password !== this.state.confirmPassword;
              this.setState({ alertPasswordNotMatch });

              if(!alertPasswordNotMatch && !this.isFormDisabled()) {
                this.handleChangePassword();
              }
            }}
            noValidate
          >
            <h2><Translate value="auth.setNewPassword" /></h2>
            { this.statusMessage() }
            <TextField
              label={<Translate value="auth.password" />}
              type="password"
              margin="normal"
              fullWidth
              disabled={this.isFormDisabled()}
              value={this.state.password}
              onChange={event => {
                this.setState({ password: event.target.value });
                if(this.props.error) {
                  this.props.cleanError();
                }
              }}
            />
            <TextField
              label={<Translate value="auth.confirmPassword" />}
              type="password"
              margin="normal"
              fullWidth
              disabled={this.isFormDisabled()}
              value={this.state.confirmPassword}
              onChange={event => {
                this.setState({ confirmPassword: event.target.value });
                if(this.props.error) {
                  this.props.cleanError();
                }
              }}
            />
            <div style={{position: 'relative', marginTop: "12px"}}>
              <Button
                color="secondary"
                variant="contained"
                disabled={this.isFormDisabled()}
                type="submit"
              >
                <Translate value="auth.changePassword" />
              </Button>
              {this.props.loading && <CircularProgress className="buttonLoading" size={24} />}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

PasswordRecovery.propTypes = {
  error: PropTypes.object,
  router: PropTypes.object,

  isValidUserToken: PropTypes.func,
  changeLostPassword: PropTypes.func,
  login: PropTypes.func,
  cleanError: PropTypes.func,
  close: PropTypes.func,
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordRecovery);
