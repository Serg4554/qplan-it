import React, { Component } from 'react';
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import { open as openAuth } from "../state/ducks/auth/operations";
import { retrieveUser } from "../state/ducks/session/operations"
import { push } from "connected-react-router";
import { Route, Switch } from "react-router-dom";
import { isMobile } from 'react-device-detect';

import '../styles/App.css';
import { Translate } from 'react-redux-i18n';
import Particles from 'react-particles-js';
import particlesMotion from '../config/particlesMotion.json'
import particlesStatic from '../config/particlesStatic.json'
import Auth from './Auth'
import Paper from '@material-ui/core/Paper';
import Home from './Home'


const mapStateToProps = state => {
  return {
    user: state.auth.user
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

  render() {
    return (
      <div>
        <Particles params={isMobile ? particlesStatic : particlesMotion} width="100%" height="400px" className="backgroundHeader" />

        <div className="contentHeader">
          <h1 className="title" style={{fontFamily: "Audiowide", margin: 0, paddingTop: "50px", cursor: "pointer"}} onClick={() => this.props.goToUrl("/")}>
            <Translate value="app_name" />
          </h1>
          <h2 className="motto" style={{margin: 0, paddingBottom: "50px"}}><Translate value="motto" /></h2>
          <div>
            <Auth className="login" />
          </div>
        </div>

        <Paper className="content" elevation={1}>
          <Switch>
            {/*<Route exact path="/create" component={() => <div style={{height: "500px"}} />} />*/}
            <Route path="/" component={Home} />
          </Switch>
        </Paper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
