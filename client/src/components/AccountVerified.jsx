import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";

import { Translate } from "react-redux-i18n";
import LinearProgress from "@material-ui/core/LinearProgress/LinearProgress";


const mapStateToProps = state => {
  return {
    router: state.router
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class AccountVerified extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      redirectProgress: 0
    };

    this.progress = setInterval(() => this.setState({ redirectProgress: this.state.redirectProgress + 6 }), 200);
    this.timeout = setTimeout(function () {
      clearInterval(this.progress);
      props.goToUrl("/login");
    }, 4000);
  }

  componentWillUnmount() {
    if(this.progress) {
      clearInterval(this.progress);
    }
    if(this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  render() {
    return (
      <div>
        <div style={{maxWidth: "500px", margin: "0 auto", textAlign: "center"}}>
          <h1><Translate value="accountVerified" /></h1>
          <LinearProgress
            style={{marginTop: "20px"}}
            color="secondary"
            variant="determinate"
            value={this.state.redirectProgress}
          />
          <h3><Translate value="accountVerifiedMessage" /></h3>
        </div>
      </div>
    );
  }
}

AccountVerified.propTypes = {
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountVerified);
