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
    const period = this.props.day.period;

    return (
      <Dialog
        open={this.state.eventToRemove != null}
        onClose={() => this.setState({ eventToRemove: null })}
      >
        <DialogTitle><Translate value="createEvent.releaseBlockedHours"/></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Translate value="createEvent.releaseBlockedHoursMessage"/>
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
              let events = this.props.day.blockedPeriods.slice();
              events.splice(events.findIndex(e => e.start.getTime() === this.state.eventToRemove.start.getTime()), 1);
              this.setState({ eventToRemove: null });
              this.props.onDayUpdated({ period, blockedPeriods: events });
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

  encodePeriods(blockedPeriods) {
    let events = [];

    let dayStart, periodStart, diff, start, end;
    blockedPeriods.forEach(blockedPeriod => {
      dayStart = moment(this.props.day.period.start);
      periodStart = moment(dayStart).hours(blockedPeriod.start.getHours()).minutes(blockedPeriod.start.getMinutes());
      diff = Math.floor(periodStart.diff(dayStart) / 60000);

      start = moment(dayStart).startOf('day').add(diff, 'm').toDate();
      end = moment(dayStart).startOf('day').add(blockedPeriod.duration + diff, 'm').toDate();
      events.push({
        start,
        end: end.getHours() === 0 && end.getMinutes() === 0 ? moment(dayStart).endOf('day').toDate() : end
      });
    });

    return events;
  }

  decodePeriods(events) {
    let blockedPeriods = [];

    let dayStart, eventStart, diff, start, duration;
    events.forEach(event => {
      dayStart = moment(this.props.day.period.start);
      eventStart = moment(dayStart).hours(event.start.getHours()).minutes(event.start.getMinutes());
      diff = moment(dayStart).hours(event.end.getHours()).minutes(event.end.getMinutes()).diff(eventStart) / 60000;

      start = dayStart.add(Math.floor(eventStart.diff(dayStart) / 60000), 'm').toDate();
      duration = Math.ceil(diff / 5) * 5;
      blockedPeriods.push({ start, duration });
    });

    return blockedPeriods;
  }

  renderEventsBuilder() {
    const duration = this.props.day.period.duration === 0 ? 1440 : this.props.day.period.duration;
    const start = moment().startOf('day').toDate();
    const end = moment().startOf('day').add(duration, 'm').toDate();

    if(this.state.showBlockedPeriods) {
      return (
        <div>
          <EventsBuilder
            startTime={start}
            endTime={end}
            precise={this.state.precise}
            events={this.encodePeriods(this.props.day.blockedPeriods)}
            onEventsUpdated={events => {
              this.props.onDayUpdated({
                period: this.props.day.period,
                blockedPeriods: this.decodePeriods(getEvents(start, end, events))
              });
            }}
            onRemoveEvent={event => this.setState({ eventToRemove: this.decodePeriods([event])[0] })}
            eventsTitle={I18n.t("createEvent.unavailable")}
            maxHeight={400}
            timeFormat={"h:mm a"}
            style={{
              borderTop: "1px solid #e9e9e9",
              borderBottomLeftRadius: "4px",
              borderBottomRightRadius: "4px"
            }}
          />
          <Tooltip title={I18n.t("createEvent.preciseSelection")} placement="right" disableFocusListener>
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

  isDayCancelledByHours() {
    return moment(this.props.day.period.start).isSame(moment(this.props.day.period.end));
  }

  isDayCancelledByBlockedPeriods() {
    const start = moment(this.props.day.period.start);
    const end = moment(this.props.day.period.end);
    const blockedPeriod = this.props.day.blockedPeriods.length === 1 ? this.props.day.blockedPeriods[0] : null;

    return blockedPeriod && start.isSame(moment(blockedPeriod.start)) && end.isSame(moment(blockedPeriod.end));
  }

  renderWarnings() {
    if(this.isDayCancelledByHours()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#424242", color: "#fff"}}
            label={<Translate value="createEvent.dayCancelledByHours" />}
          />
        </div>
      );
    } else if(this.isDayCancelledByBlockedPeriods()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#424242", color: "#fff"}}
            label={<Translate value="createEvent.dayCancelledByBlockedPeriods" />}
          />
        </div>
      );
    }
  }

  render() {
    if(!this.props.day.period || !this.props.day.blockedPeriods) {
      return <div />;
    }

    const start = this.props.day.period.start;
    const end = this.props.day.period.end;
    const cancelledByHours = this.isDayCancelledByHours();

    return (
      <Paper style={this.props.style}>
        <div style={{padding: "16px", paddingBottom: "0"}}>
          <Typography variant="headline" component="h3">
            <Translate value="createEvent.schedule" />
          </Typography>
          <div style={{display: "inline-block", textAlign: "left", marginTop: "8px"}}>
            <span style={{fontWeight: "bold"}}><Translate value="createEvent.start" /></span>
            <TimeInput
              mode='12h'
              value={start}
              onChange={time => {
                const _start = moment(start).startOf('day').hours(time.getHours()).minutes(time.getMinutes()).toDate();
                this.props.onDayUpdated({
                  period: {start: _start, end},
                  blockedPeriods: getEvents(_start, end, this.props.day.blockedPeriods)
                });
              }}
              style={{width: "100%", maxWidth: "80px", marginLeft: "5px"}}
              minutesStep={5}
              cancelOnClose={false}
              inputClasses={{input: "text-align-center"}}
            />
          </div>
          <div style={{display: "inline-block", textAlign: "right", marginLeft: "16px"}}>
            <span style={{fontWeight: "bold"}}><Translate value="createEvent.end" /></span>
            <TimeInput
              mode='12h'
              value={end}
              onChange={time => {
                const _end = moment(end).startOf('day').hours(time.getHours()).minutes(time.getMinutes()).toDate();
                this.props.onDayUpdated({
                  period: {start, end: _end},
                  blockedPeriods: getEvents(start, _end, this.props.day.blockedPeriods)
                });
              }}
              style={{width: "100%", maxWidth: "80px", marginLeft: "5px"}}
              minutesStep={5}
              cancelOnClose={false}
              inputClasses={{input: "text-align-center"}}
            />
          </div>

          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={this.state.showBlockedPeriods && !cancelledByHours}
                onChange={() => this.setState({ showBlockedPeriods: !this.state.showBlockedPeriods })}
                disabled={cancelledByHours}
              />
            }
            label={<Translate value="createEvent.showSelectionOfHoursNotAvailable" />}
            style={{textAlign: "left"}}
          />
        </div>

        { this.renderWarnings() }
        { this.renderEventsBuilder() }
        { this.removeEventDialog() }
      </Paper>
    );
  }
}

TimeRangePicker.propTypes = {
  day: PropTypes.object,
  onDayUpdated: PropTypes.func.isRequired,
  preciseByDefault: PropTypes.bool,
  style: PropTypes.object
};

export default TimeRangePicker;
