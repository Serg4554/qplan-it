import React from "react";
import PropTypes from "prop-types";

import Typography from "@material-ui/core/Typography";
import {I18n, Translate} from "react-redux-i18n";
import TimeInput from "material-ui-time-picker";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import GpsNotFixed from "../../../node_modules/@material-ui/icons/GpsNotFixed";
import GpsFixedIcon from "../../../node_modules/@material-ui/icons/GpsFixed";
import Paper from "@material-ui/core/Paper";
import EventsBuilder from "./EventsBuilder";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";


class TimeRangePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      removeEvent: null,
      precise: !!props.preciseByDefault
    }
  }

  removeEventDialog() {
    return(
      <Dialog
        open={this.state.removeEvent != null}
        onClose={() => this.setState({ removeEvent: null })}
      >
        <DialogTitle><Translate value="event.releaseBlockedHours"/></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Translate value="event.releaseBlockedHoursMessage"/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ removeEvent: null })}
            color="secondary"
          >
            <Translate value="common.no"/>
          </Button>
          <Button
            onClick={() => {
              let events = this.state.events.slice();
              events.splice(events.indexOf(this.state.removeEvent), 1);
              this.setState({ events, removeEvent: null });
            }}
            color="primary"
            autoFocus
          >
            <Translate value="common.yes"/>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  getPreciseIcon() {
    return this.state.precise ?
      <GpsFixedIcon style={{fontSize: "15pt"}} /> :
      <GpsNotFixed style={{fontSize: "15pt"}} />;
  }

  render() {
    const { startTime, endTime, onTimesUpdated } = this.props;

    return (
      <Paper style={{width: "368px", textAlign: "center", position: "relative"}}>
        <div style={{padding: "16px"}}>
          <Typography variant="headline" component="h3">
            <Translate value="event.hoursAvailable" />
          </Typography>
          <div style={{width: "153px", display: "inline-block", textAlign: "left", marginTop: "8px"}}>
            <span style={{fontWeight: "bold"}}><Translate value="event.start" /></span>
            <TimeInput
              mode='12h'
              value={startTime}
              onChange={time => {
                startTime.setHours(time.getHours());
                startTime.setMinutes(time.getMinutes());
                onTimesUpdated(startTime, endTime);
              }}
              style={{width: "90px", marginLeft: "5px"}}
              minutesStep={5}
              cancelOnClose={false}
              inputClasses={{input: "text-align-center"}}
            />
          </div>
          <div style={{width: "153px", display: "inline-block", textAlign: "right"}}>
            <span style={{fontWeight: "bold"}}><Translate value="event.end" /></span>
            <TimeInput
              mode='12h'
              value={endTime}
              onChange={time => {
                endTime.setHours(time.getHours());
                endTime.setMinutes(time.getMinutes());
                onTimesUpdated(startTime, endTime);
              }}
              style={{width: "90px", marginLeft: "5px"}}
              minutesStep={5}
              cancelOnClose={false}
              inputClasses={{input: "text-align-center"}}
            />
          </div>
        </div>
        <EventsBuilder
          startTime={startTime}
          endTime={endTime}
          precise={this.state.precise}
          events={[]}
          onEventsUpdated={() => {}}
          onRemoveEvent={removeEvent => this.setState({ removeEvent })}
          eventsTitle={I18n.t("event.unavailable")}
          maxHeight={400}
          timeFormat={"h:mm a"}
          style={{
            borderTop: "1px solid #e9e9e9",
            borderBottomLeftRadius: "4px",
            borderBottomRightRadius: "4px"
          }}
        />
        <Tooltip title={I18n.t("event.preciseSelection")} placement="right" disableFocusListener>
          <Button
            variant="fab"
            mini
            aria-label="Precise"
            color={this.state.precise ? "primary" : "secondary"}
            style={{zIndex: "10", position: 'absolute', bottom: "10px", right: "10px"}}
            onClick={() => this.setState({ precise: !this.state.precise })}
          >
            { this.getPreciseIcon() }
          </Button>
        </Tooltip>

        { this.removeEventDialog() }
      </Paper>
    );
  }
}

TimeRangePicker.propTypes = {
  startTime: PropTypes.instanceOf(Date).isRequired,
  endTime: PropTypes.instanceOf(Date).isRequired,
  onTimesUpdated: PropTypes.func.isRequired,
  preciseByDefault: PropTypes.bool,
};

export default TimeRangePicker;
