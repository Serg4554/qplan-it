import React from "react";
import PropTypes from "prop-types";
import moment from 'moment';

import Typography from "@material-ui/core/Typography";
import {I18n, Translate} from "react-redux-i18n";
import TimeInput from "material-ui-time-picker";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import GpsNotFixed from "../../../node_modules/@material-ui/icons/GpsNotFixed";
import GpsFixedIcon from "../../../node_modules/@material-ui/icons/GpsFixed";
import Paper from "@material-ui/core/Paper";
import EventsBuilder from "./EventsBuilder";
import { getEvents } from "./EventsBuilder";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";


class TimeRangePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      eventToRemove: null,
      precise: !!props.preciseByDefault,
      showBlockedPeriods: false
    }
  }

  removeEventDialog() {
    const period = this.props.times.period;

    return (
      <Dialog
        open={this.state.eventToRemove != null}
        onClose={() => this.setState({ eventToRemove: null })}
      >
        <DialogTitle><Translate value="event.releaseBlockedHours"/></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Translate value="event.releaseBlockedHoursMessage"/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ eventToRemove: null })}
            color="secondary"
          >
            <Translate value="common.no"/>
          </Button>
          <Button
            onClick={() => {
              let events = this.props.times.blockedPeriods.slice();
              events.splice(events.findIndex(e => e.start.getTime() === this.state.eventToRemove.start.getTime()), 1);
              this.setState({ eventToRemove: null });
              this.props.onTimesUpdated({ period, blockedPeriods: getEvents(period.start, period.end, events) });
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

  renderEventsBuilder() {
    const start = this.props.times.period.start;
    const end = this.props.times.period.end;

    if(this.state.showBlockedPeriods && moment(start).isBefore(moment(end))) {
      return (
        <div>
          <EventsBuilder
            startTime={start}
            endTime={end}
            precise={this.state.precise}
            events={this.props.times.blockedPeriods}
            onEventsUpdated={events => {
              this.props.onTimesUpdated({
                period: {start, end},
                blockedPeriods: getEvents(start, end, events)
              });
            }}
            onRemoveEvent={eventToRemove => this.setState({ eventToRemove })}
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
        </div>
      );
    }
  }

  isEndTimeBeforeStartTime() {
    return moment(this.props.times.period.start).isAfter(moment(this.props.times.period.end));
  }

  isDayCancelledByHours() {
    return moment(this.props.times.period.start).isSame(moment(this.props.times.period.end));
  }

  isDayCancelledByBlockedPeriods() {
    const start = moment(this.props.times.period.start);
    const end = moment(this.props.times.period.end);
    const blockedPeriod = this.props.times.blockedPeriods.length === 1 ? this.props.times.blockedPeriods[0] : null;

    return blockedPeriod && start.isSame(moment(blockedPeriod.start)) && end.isSame(moment(blockedPeriod.end));
  }

  renderWarnings() {
    if(this.isEndTimeBeforeStartTime()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#D50000", color: "#fff"}}
            label={<Translate value="event.endTimeBeforeStartTime" />}
          />
        </div>
      );
    } else if(this.isDayCancelledByHours()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#424242", color: "#fff"}}
            label={<Translate value="event.dayCancelledByHours" />}
          />
        </div>
      );
    } else if(this.isDayCancelledByBlockedPeriods()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#424242", color: "#fff"}}
            label={<Translate value="event.dayCancelledByBlockedPeriods" />}
          />
        </div>
      );
    }
  }

  render() {
    if(!this.props.times.period || !this.props.times.blockedPeriods) {
      return <div />;
    }

    const start = this.props.times.period.start;
    const end = this.props.times.period.end;
    const cancelledByHours = this.isDayCancelledByHours();

    return (
      <Paper style={this.props.style}>
        <div style={{padding: "16px"}}>
          <Typography variant="headline" component="h3">
            <Translate value="event.schedule" />
          </Typography>
          <div style={{width: "153px", display: "inline-block", textAlign: "left", marginTop: "8px"}}>
            <span style={{fontWeight: "bold"}}><Translate value="event.start" /></span>
            <TimeInput
              mode='12h'
              value={start}
              onChange={time => {
                const _start = moment(start).startOf('day').hours(time.getHours()).minutes(time.getMinutes()).toDate();
                this.props.onTimesUpdated({
                  period: {start: _start, end},
                  blockedPeriods: getEvents(_start, end, this.props.times.blockedPeriods)
                });
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
              value={end}
              onChange={time => {
                const _end = moment(end).startOf('day').hours(time.getHours()).minutes(time.getMinutes()).toDate();
                this.props.onTimesUpdated({
                  period: {start, end: _end},
                  blockedPeriods: getEvents(start, _end, this.props.times.blockedPeriods)
                });
              }}
              style={{width: "90px", marginLeft: "5px"}}
              minutesStep={5}
              cancelOnClose={false}
              inputClasses={{input: "text-align-center"}}
            />
          </div>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={this.state.showBlockedPeriods && !cancelledByHours}
              onChange={() => this.setState({ showBlockedPeriods: !this.state.showBlockedPeriods })}
              disabled={cancelledByHours || this.isEndTimeBeforeStartTime()}
            />
          }
          label={<Translate value="event.showSelectionOfHoursNotAvailable" />}
        />

        { this.renderWarnings() }
        { this.renderEventsBuilder() }
        { this.removeEventDialog() }
      </Paper>
    );
  }
}

TimeRangePicker.propTypes = {
  times: PropTypes.object,
  onTimesUpdated: PropTypes.func.isRequired,
  preciseByDefault: PropTypes.bool,
  style: PropTypes.object
};

export default TimeRangePicker;
