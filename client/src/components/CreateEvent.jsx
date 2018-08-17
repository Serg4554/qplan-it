import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as EventOperations from '../state/ducks/event/operations';

import { Translate } from "react-redux-i18n";


const mapStateToProps = state => {
  /** @namespace state.passwordRecovery */
  return {
    title: state.event.title,
    router: state.router
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  cancel: EventOperations.cancel,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  componentWillUnmount() {
    this.props.cancel();
  }

  render() {
    return (
      <div>
        <div style={{textAlign: "center"}}>
          <h1>{this.props.title}</h1>
          <h3><Translate value="event.selectDays" /></h3>
        </div>
      </div>
    );
  }
}

CreateEvent.propTypes = {
  error: PropTypes.object,
  router: PropTypes.object,

  isValidUserToken: PropTypes.func,
  changeLostPassword: PropTypes.func,
  login: PropTypes.func,
  cleanError: PropTypes.func,
  close: PropTypes.func,
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
