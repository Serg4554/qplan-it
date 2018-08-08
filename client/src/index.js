import React from 'react';
import ReactDOM from 'react-dom';
import store, { history } from './state/store';
import Provider from "react-redux/es/components/Provider";
import { ConnectedRouter } from "connected-react-router";
import { Route, Switch } from "react-router-dom";

import './styles/index.css';
import registerServiceWorker from './registerServiceWorker';
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import theme from "./config/theme";
import App from "./components/App";


ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
      <MuiThemeProvider theme={createMuiTheme(theme)}>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </MuiThemeProvider>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root'));
registerServiceWorker();
