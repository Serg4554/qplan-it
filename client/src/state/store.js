import { applyMiddleware, createStore, compose, combineReducers } from 'redux';
import * as reducers from "./ducks";
import thunk from 'redux-thunk'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import createHistory from 'history/createBrowserHistory'
import { loadTranslations, setLocale, syncTranslationWithStore } from 'react-redux-i18n';
import i18n from '../config/i18n';
import detectBrowserLanguage from 'detect-browser-language'

export const history = createHistory();

const initialState = {};
const enhancers = [];
const middleware = [
  thunk,
  routerMiddleware(history),
];

if (process.env.NODE_ENV === 'development') {
  /** @namespace window.__REDUX_DEVTOOLS_EXTENSION__ */
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension())
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

const rootReducer = combineReducers(reducers);

const store = createStore(
  connectRouter(history)(rootReducer),
  initialState,
  composedEnhancers
);

syncTranslationWithStore(store);
store.dispatch(loadTranslations(i18n));

let lang = detectBrowserLanguage() || "en";
if(lang.length > 2) {
  lang = lang.split('-')[0].split('_')[0];
}
lang = lang.toLowerCase();
store.dispatch(setLocale(Object.keys(i18n).indexOf(lang) !== -1 ? lang : "en"));

export default store;
