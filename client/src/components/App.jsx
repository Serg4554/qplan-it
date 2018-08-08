import React, { Component } from 'react';
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import { open as openAuth } from "../state/ducks/auth/operations";
import { retrieveUser } from "../state/ducks/session/operations"
import { push } from "connected-react-router";
import { Route, Switch } from "react-router-dom";

import '../styles/App.css';
import { Translate } from 'react-redux-i18n';
import Particles from 'react-particles-js';
import ParticlesParams from '../config/particles.json'
import Auth from './Auth'
import Paper from '@material-ui/core/Paper';
import Welcome from './Welcome'


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

    const logged = !!this.props.user || !!window.localStorage.getItem('jwt');
    if(this.props.location.pathname === "/login") {
      if(logged) {
        this.props.goToUrl("/");
      } else {
        this.props.openAuth();
      }
    }
  }

  render() {
    return (
      <div>
        <Particles params={ParticlesParams} width="100%" height="300px" className="backgroundHeader" />

        <div className="contentHeader">
          <div style={{position: "absolute", maxWidth: "1400px", width: "100%"}}>
            <Auth style={{float: "right", margin: "10px"}} />
          </div>
          <h1 style={{margin: 0, fontSize: "80pt", paddingTop: "50px"}}><Translate value="app_name" /></h1>
          <h2 style={{margin: 0, fontSize: "20pt", paddingBottom: "50px"}}><Translate value="motto" /></h2>
        </div>

        <Paper className="content" elevation={1}>
          <Switch>
            {/*<Route exact path="/create" component={() => <div style={{height: "500px"}} />} />*/}
            <Route path="/" component={Welcome} />
          </Switch>
        </Paper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
