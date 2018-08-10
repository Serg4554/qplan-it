import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import apiService from "../state/apiService";
import {
  isValidToken, changeLostPassword, login, goodRequest, badRequest, close
} from "../state/ducks/auth/operations"
import { CHANGE_PASSWORD_SUCCESS } from "../state/ducks/auth/types"

import Chip from "@material-ui/core/Chip";
import { Translate } from "react-redux-i18n";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import PasswordValidator from "password-validator";
import CircularProgress from "@material-ui/core/CircularProgress";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";

const passwordSchema = new PasswordValidator();
passwordSchema
  .is().min(8)
  .is().max(100)
  .has().uppercase()
  .has().lowercase();


const mapStateToProps = state => {
  return {
    fail: state.auth.fail,
    loading: state.auth.loading,
    router: state.router,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  isValidToken,
  changeLostPassword,
  login,
  goodRequest,
  badRequest,
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
      loading: false,
      success: false,
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
    this.props.close();
  }

  success() {
    this.setState({loading: false, success: true});

    const progress = setInterval(() => this.setState({ redirectProgress: this.state.redirectProgress + 15 }), 200);

    const props = this.props;
    setTimeout(function () {
      clearInterval(progress);
      props.goToUrl("/");
    }, 2000);
  }

  handleChangePassword() {
    if(!this.props.fail) {
      if(this.state.password && this.state.confirmPassword && this.state.password === this.state.confirmPassword) {
        this.setState({loading: true});

        this.props.changeLostPassword(this.state.password, this.token)
          .then(response => {
            if(response && response.type === CHANGE_PASSWORD_SUCCESS) {
              apiService.setToken(this.token);
              apiService.Auth.getUser(this.userId)
                .then(user => {
                  if(user && user.email) {
                    this.props.login(user.email, this.state.password)
                      .then(() => this.success())
                      .catch(() => this.success());
                  } else {
                    this.success();
                  }
                })
                .catch(() => this.success());
            } else {
              this.setState({loading: false})
            }
          })
          .catch(() => this.setState({loading: false}));
      } else {
        this.props.badRequest();
      }
    }
  }

  statusMessage() {
    let success = false;
    let message = "";

    if(this.props.fail && this.state.password !== this.state.confirmPassword) {
      success = false;
      message = "passwordsDoNotMatch";
    } else if(this.props.fail && this.state.password && !passwordSchema.validate(this.state.password, {})) {
      success = false;
      message = "weakPasswordMessage";
    } else if(this.props.fail) {
      success = false;
      message = "expiredLink";
    } else if(this.state.success) {
      success = true;
      message = "passwordSuccessfullyChanged";
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

  isButtonDisabled() {
    return (this.props.fail && !this.state.password) ||
      this.state.password === "" ||
      this.state.confirmPassword === "" ||
      this.state.loading ||
      this.state.success;
  }

  render() {
    return (
      <div>
        <div style={{maxWidth: "500px", margin: "0 auto", textAlign: "center"}}>
          <form
            onSubmit={e => {
              e.preventDefault();
              if(!this.isButtonDisabled()) {
                this.handleChangePassword();
              }
            }}
            noValidate
          >
            <h2><Translate value="setNewPassword" /></h2>
            { this.statusMessage() }
            <TextField
              label={<Translate value="password" />}
              type="password"
              margin="normal"
              fullWidth
              disabled={(this.props.fail && !this.state.password)  || this.state.loading || this.state.success}
              value={this.state.password}
              onChange={event => {
                this.setState({ password: event.target.value });
                if(this.props.fail) {
                  this.props.goodRequest();
                }
              }}
            />
            <TextField
              label={<Translate value="confirmPassword" />}
              type="password"
              margin="normal"
              fullWidth
              disabled={(this.props.fail && !this.state.password) || this.state.loading || this.state.success}
              value={this.state.confirmPassword}
              onChange={event => {
                this.setState({ confirmPassword: event.target.value });
                if(this.props.fail) {
                  this.props.goodRequest();
                }
              }}
            />
            <div style={{position: 'relative', marginTop: "12px"}}>
              <Button
                color="secondary"
                variant="contained"
                disabled={this.isButtonDisabled()}
                type="submit"
              >
                <Translate value="changePassword" />
              </Button>
              {this.state.loading && <CircularProgress className="buttonLoading" size={24} />}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

PasswordRecovery.propTypes = {
  fail: PropTypes.bool,
  router: PropTypes.object,

  isValidUserToken: PropTypes.func,
  changeLostPassword: PropTypes.func,
  login: PropTypes.func,
  goodRequest: PropTypes.func,
  badRequest: PropTypes.func,
  close: PropTypes.func,
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(PasswordRecovery);
