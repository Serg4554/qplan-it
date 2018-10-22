import React from "react";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import { setTitle as setEventTitle } from "../state/ducks/createEvent/operations";

import TextField from "@material-ui/core/TextField";
import { Translate } from 'react-redux-i18n';
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";


const mapStateToProps = state => {
  return {
    eventTitle: state.createEvent.title
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
      eventTitle: props.eventTitle || ""
    };
  };

  componentDidMount() {
    if(this.props.eventTitle) {
      window.onbeforeunload = () => "Changes will be lost";
    }
  }

  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  handleCreateEvent() {
    if(this.state.eventTitle) {
      this.props.setEventTitle(this.state.eventTitle);
      this.props.goToUrl("/create_event")
    } else {
      this.eventTitleInput.focus();
    }
  }

  render() {
    return (
      <div>
        <div className="createEventLayout">
          <form onSubmit={e => {
            e.preventDefault();
            this.handleCreateEvent();
          }} noValidate>
            <TextField
              autoFocus
              inputRef={obj => this.eventTitleInput = obj}
              id="event"
              label={<Translate value="createEvent.eventName"/>}
              margin="normal"
              fullWidth={true}
              value={this.state.eventTitle}
              onChange={event => {
                if (event.target.value.length <= 85) {
                  this.setState({eventTitle: event.target.value})
                }
              }}
            />
            <Button type="submit" variant="contained" color="primary">
              <Translate value={this.props.eventTitle ? "createEvent.continue" : "createEvent.create"}/>
            </Button>
          </form>
        </div>

        <div style={{textAlign: "center"}}>
          <h3 style={{fontFamily: "Audiowide", fontSize: "40px", color: "#444", marginBottom: 0}}>Developer preview</h3>
          <p><Translate value="home.description" /></p>

          <Card style={{display: "inline-block", maxWidth: "300px", margin: "10px", background: "#FAFAFA"}}>
            <CardMedia
              component="img"
              image="/calendar.png"
              style={{width: "200px", padding: "50px"}}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                <Translate value="home.selectDays" />
              </Typography>
              <Typography component="p" style={{textAlign: "justify"}}>
                <Translate value="home.selectDaysDescription" />
              </Typography>
            </CardContent>
          </Card>

          <Card style={{display: "inline-block", maxWidth: "300px", margin: "10px", background: "#FAFAFA"}}>
            <CardMedia
              component="img"
              image="/clock.png"
              style={{width: "200px", padding: "50px"}}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                <Translate value="home.selectHours" />
              </Typography>
              <Typography component="p" style={{textAlign: "justify"}}>
                <Translate value="home.selectHoursDescription" />
              </Typography>
            </CardContent>
          </Card>

          <Card style={{display: "inline-block", maxWidth: "300px", margin: "10px", background: "#FAFAFA"}}>
            <CardMedia
              component="img"
              image="/tick.png"
              style={{width: "200px", padding: "50px"}}
            />
            <CardContent>
              <Typography gutterBottom variant="h5" component="h2">
                <Translate value="home.thatIsAll" />
              </Typography>
              <Typography component="p" style={{textAlign: "justify"}}>
                <Translate value="home.thatIsAllDescription" />
              </Typography>
            </CardContent>
          </Card>

          <p style={{fontFamily: "monospace"}}>
            <span><Translate value="home.developedBy" /></span>
            <br/>
            <span style={{color: "#2E7D32"}}>/* <Translate value="home.checkOutTheCode" /> <a style={{color: "#1565C0"}} href="https://github.com/Serg4554/qplan-it" target="_blank">GitHub</a> */</span>
          </p>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
