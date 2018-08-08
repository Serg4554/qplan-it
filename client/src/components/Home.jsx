import React from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";

import TextField from "@material-ui/core/TextField";
import { Translate } from 'react-redux-i18n';
import Button from "@material-ui/core/Button";


const mapStateToProps = () => {
  return {

  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

const Home = (props) => {
  return(
    <div>
      <div className="createEventLayout">
        <TextField
          id="event"
          label={<Translate value="eventName" />}
          margin="normal"
          fullWidth={true}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => props.goToUrl("/create")}
        >
          <Translate value="createEvent" />
        </Button>
        <img
          src={"/mars.png"}
          style={{width: "100%", height: "auto", marginTop: "50px"}}
          alt="Mars"
        />
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
