import { combineReducers } from 'redux';
import auth from './reducers/auth';
import { localizeReducer } from "react-localize-redux";

export default combineReducers({
  localize: localizeReducer,
  auth,
});
