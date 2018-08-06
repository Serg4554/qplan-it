import React, { Component } from 'react';
import connect from "react-redux/es/connect/connect";
import { bindActionCreators } from "redux";
import { open as openAuth, retrieveUser } from "../reducers/auth";
import { push } from "connected-react-router";
import { withLocalize } from "react-localize-redux";
import { renderToStaticMarkup } from "react-dom/server";
import { languages, translations } from '../locale'
import detectBrowserLanguage from 'detect-browser-language'

import './App.css';
import { Translate } from "react-localize-redux";
import Particles from 'react-particles-js';
import ParticlesParams from './particles.json'
import UserLogin from './UserLogin'
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';


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
  constructor(props) {
    super(props);

    this.props.initialize({
      languages: languages,
      translation: translations,
      options: { renderToStaticMarkup }
    });

    const lang = languages.find(lng => lng.code === detectBrowserLanguage());
    this.props.setActiveLanguage(lang ? lang.code : "en");
  }

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
        <Particles
          params={ParticlesParams}
          width="100%"
          height="300px"
          className="backgroundHeader"
        />

        <div className="contentHeader">
          <div style={{position: "absolute", maxWidth: "1400px", width: "100%"}}>
            <UserLogin style={{float: "right", margin: "10px"}} />
          </div>
          <h1 style={{margin: 0, fontSize: "80pt", paddingTop: "50px"}}><Translate id="app_name" /></h1>
          <h2 style={{margin: 0, fontSize: "20pt", paddingBottom: "50px"}}><Translate id="motto" /></h2>
        </div>

        <Paper className="content" elevation={1}>
          <div className="createEventLayout">
            <TextField
              id="event"
              label={<Translate id="eventName" />}
              margin="normal"
              fullWidth={true}
            />
            <Button
              variant="contained"
              color="primary"
            >
              <Translate id="createEvent" />
            </Button>
            <img
              src={"/mars.png"}
              style={{marginTop: "50px"}}
              alt="Mars"
            />
          </div>
        </Paper>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withLocalize(App));
