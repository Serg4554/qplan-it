import React, { Component } from 'react';
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import { open as openAuth } from "../state/ducks/auth/operations";
import { retrieveUser } from "../state/ducks/session/operations"
import { push } from "connected-react-router";
import { Route, Switch } from "react-router-dom";
import { isMobile } from 'react-device-detect';

import '../styles/app.css';
import { Translate } from 'react-redux-i18n';
import Particles from 'react-particles-js';
import particlesMotion from '../config/particlesMotion.json'
import particlesStatic from '../config/particlesStatic.json'
import Auth from './Auth'
import Paper from '@material-ui/core/Paper';
import Home from './Home'
import PasswordRecovery from './PasswordRecovery'
import AccountVerified from './AccountVerified'
import CreateEvent from './CreateEvent'
import Redirect from "react-router-dom/Redirect";


const mapStateToProps = state => {
  return {
    eventTitle: state.event.title,
    user: state.session.user,
    location: state.router.location.pathname
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  retrieveUser,
  openAuth,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class App extends Component {
  componentWillMount() {
    this.props.retrieveUser();
  }

  isLargeHeader() {
    return this.props.location === "/" || this.props.location === "/login";
  }

  renderHeader() {
    return (
      <div>
        <Particles
          params={isMobile ? particlesStatic : particlesMotion}
          width="100%"
          height={this.isLargeHeader() ? "400px": "200px"}
          className="backgroundHeader"
        />

        <div className={this.isLargeHeader() ? "contentHeaderLarge" : "contentHeaderSmall"}>
          <h1
            className={this.isLargeHeader() ? "headerTitleLarge" : "headerTitleSmall"}
            onClick={() => this.props.goToUrl("/")}
          >
            <Translate value="common.app_name" />
          </h1>
          <h2 className={this.isLargeHeader() ? "headerMottoLarge" : "headerMottoSmall"}>
            <Translate value="common.motto" />
          </h2>
          <div>
            <Auth className={this.isLargeHeader() ? "headerAuthLarge" : "headerAuthSmall"} />
          </div>
        </div>
      </div>
    );
  }

  renderLogin() {
    return !this.props.user ?
      <Home /> :
      <Redirect to='/' />;
  }

  renderCreate() {
    return this.props.eventTitle ?
      <CreateEvent /> :
      <Redirect to='/' />;
  }

  render() {
    return (
      <div>
        { this.renderHeader() }

        <Paper className="content" elevation={1}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/login" component={ () => this.renderLogin() } />
            <Route exact path="/create" component={ () => this.renderCreate() } />
            <Route exact path="/password_recovery" component={PasswordRecovery} />
            <Route exact path="/account_verified" component={AccountVerified} />
          </Switch>
        </Paper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
