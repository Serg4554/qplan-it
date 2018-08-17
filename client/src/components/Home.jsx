import React from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import { setTitle as setEventTitle } from "../state/ducks/event/operations";

import TextField from "@material-ui/core/TextField";
import { Translate } from 'react-redux-i18n';
import Button from "@material-ui/core/Button";


const mapStateToProps = () => {
  return {

  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  setEventTitle,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventTitle: ""
    }
  };

  handleCreateEvent() {
    if(this.state.eventTitle) {
      this.props.setEventTitle(this.state.eventTitle);
      this.props.goToUrl("/create")
    } else {
      this.eventTitleInput.focus();
    }
  }

  render() {
    return (
      <div>
        <div className="createEventLayout">
          <form onSubmit={e => { e.preventDefault(); this.handleCreateEvent(); }} noValidate>
            <TextField
              inputRef={obj => this.eventTitleInput = obj}
              id="event"
              label={<Translate value="event.eventName" />}
              margin="normal"
              fullWidth={true}
              value={this.state.eventTitle}
              onChange={event => {
                if(event.target.value.length <= 85) {
                  this.setState({ eventTitle: event.target.value })
                }
              }}
            />
            <Button type="submit" variant="contained" color="primary">
              <Translate value="event.createEvent" />
            </Button>
          </form>
          <img
            src={"/mars.png"}
            style={{width: "100%", height: "auto", marginTop: "50px"}}
            alt="Mars"
          />
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
