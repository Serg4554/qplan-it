import React from "react";
import * as ReactDOM from "react-dom";
import PropTypes from "prop-types";
import moment from 'moment'

import "../styles/time-range-picker.css";
import BigCalendar from "react-big-calendar";
import ScrollLock from 'react-scrolllock';
import DialogTitle from "@material-ui/core/DialogTitle";
import { Translate } from "react-redux-i18n";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Paper from "@material-ui/core/Paper";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

class TimeRangePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      touchMoveLocked: false,
      eventToRemove: null
    };

    document.addEventListener("touchmove", this.touchMoveHandler.bind(this), { passive: false });
  };

  componentWillUnmount() {
    document.removeEventListener("touchmove", this.touchMoveHandler.bind(this));
  }

  componentDidMount() {
    if(this.isValidProps()) {
      this.updateFieldSize();
      this.props.ranges.forEach(r => this.addRange(r));
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.isValidProps()) {
      this.updateFieldSize();

      const timeRanges = this.getAvailableEvents().map(e => ({ start: e.start, end: e.end }));

      if(this.props.onRangesChange &&
        (this.props.startTime.getTime() !== prevProps.startTime.getTime() ||
          this.props.endTime.getTime() !== prevProps.endTime.getTime()  ||
          JSON.stringify(this.props.ranges) !== JSON.stringify(timeRanges) ||
          JSON.stringify(this.state.events) !== JSON.stringify(prevState.events))) {
        this.props.onRangesChange(timeRanges);
      }
    }
  }

  touchMoveHandler(e) {
    if(this.state.touchMoveLocked) {
      e.preventDefault();
    }
  }

  isValidProps() {
    return moment(this.props.startTime).isBefore(moment(this.props.endTime));
  }

  updateFieldSize() {
    const calendar = ReactDOM.findDOMNode(this.calendar).firstChild.lastChild;
    const hourGroups = Array.from(calendar.children[0].children);
    const dragGroups = Array.from(calendar.children[1].children).filter(c => c.className === "rbc-timeslot-group");

    let slots = [];
    hourGroups.forEach(group => slots = slots.concat(Array.from(group.children)));
    dragGroups.forEach(group => slots = slots.concat(Array.from(group.children)));

    slots.forEach(timeSlot => {
      timeSlot.style.height = this.props.precise ? "5px" : "30px";
    });
  }

  getAvailableEvents() {
    let events = this.state.events.slice().map(e => Object.assign({}, e));

    events = events.filter(e => moment(e.end).isAfter(moment(this.props.startTime)) &&
      moment(e.start).isBefore(moment(this.props.endTime)));

    events.forEach(event => {
      if(moment(event.start).isBefore(moment(this.props.startTime))) {
        event.start = this.props.startTime;
      }
      if(moment(event.end).isAfter(moment(this.props.endTime))) {
        event.end = this.props.endTime;
      }
    });

    return events;
  }

  getUnavailableEvents() {
    let events = [];

    if(this.props.startTime.getMinutes() !== 0) {
      events.push({
        start: moment(this.props.startTime).minutes(0).toDate(),
        end: this.props.startTime,
        unavailable: true
      });
    }

    if(this.props.endTime.getMinutes() !== 0) {
      events.push({
        start: this.props.endTime,
        end: moment(this.props.endTime).add(1, 'h').minutes(0).toDate(),
        unavailable: true
      });
    }

    return events;
  }

  merge(events, newEvent) {
    let mergedEvents = events.map(e => ({start: moment(e.start), end: moment(e.end)}));
    let start = moment(newEvent.start);
    let end = moment(newEvent.end);

    let eventsToMerge = mergedEvents.filter(e => {
      return (e.end.isSameOrAfter(start) && end.isSameOrAfter(e.start)) ||
        (e.start.isSameOrBefore(end) && start.isSameOrBefore(e.end))
    });

    if(eventsToMerge.length > 0) {
      eventsToMerge.forEach(eventToMerge => {
        mergedEvents.splice(mergedEvents.indexOf(eventToMerge), 1);
      });
      const eventStart = moment.min(eventsToMerge.map(e => e.start));
      const eventEnd = moment.max(eventsToMerge.map(e => e.end));
      mergedEvents.push({ start: moment.min(start, eventStart), end: moment.max(end, eventEnd) });
    } else {
      mergedEvents.push({ start, end });
    }

    mergedEvents = mergedEvents.map(e => ({
      start: e.start.toDate(),
      end: e.end.toDate()
    }));
    return mergedEvents;
  }

  addRange = ({ start, end }) => {
    let startDate = moment(start).seconds(0).milliseconds(0);
    let endDate = moment(end).seconds(0).milliseconds(0);

    if(this.state.touchMoveLocked) {
      this.setState({ touchMoveLocked: false });
    }

    if(startDate.isSameOrAfter(moment(this.props.endTime))) {
      return;
    }

    this.getUnavailableEvents().forEach(event => {
      const unStart = moment(event.start);
      const unEnd = moment(event.end);
      if(startDate.isSame(unStart) || startDate.isBetween(unStart, unEnd)) {
        startDate = unEnd;
      }
      if(endDate.isSame(unEnd) || endDate.isBetween(unStart, unEnd)) {
        endDate = startDate.isBefore(unStart) ? unStart : unEnd;
      }
    });

    if(startDate.isSame(endDate)) {
      return;
    }

    let events = this.merge(this.state.events.slice(), { start: startDate.toDate(), end: endDate.toDate() });
    this.setState({ events });
  };

  getEventWrapper(data) {
    const timeFormat = this.props.mode24Hours ? 'HH:mm' : 'h:mm a';
    const date = moment(data.event.start).format(timeFormat) + " - " + moment(data.event.end).format(timeFormat);
    const unavailableClassName = data.event.unavailable ? " rbc-event-unavailable" : "";
    return (
      <div
        className={data.children.props.className + unavailableClassName}
        style={data.children.props.style}
        onClick={!data.event.unavailable ? () => data.children.props.onClick() : undefined}
      >
        <div className="rbc-event-label">{data.event.unavailable ? "" : date}</div>
        <div className="rbc-event-content">{data.event.title}</div>
      </div>
    );
  }

  render() {
    if(!this.isValidProps()) {
      return <div />;
    }

    let events = this.props.ranges.map(r => ({...r, title: this.props.rangeTitle || ""}));
    events = events.concat(this.getUnavailableEvents());

    const timeFormat = this.props.mode24Hours ? 'HH:mm' : 'h:mm a';

    return (
      <Paper
        elevation={1}
        style={{
          maxWidth: this.props.maxWidth ? this.props.maxWidth + "px" : "100%",
          maxHeight: this.props.maxHeight ? this.props.maxHeight + "px" : "100%",
          overflowY: "scroll",
          width: "100%"
        }}
      >
        { this.state.touchMoveLocked && <ScrollLock /> }
        <BigCalendar
          ref={obj => this.calendar = obj}
          selectable
          events={events}
          defaultView={BigCalendar.Views.DAY}
          views={['day']}
          toolbar={false}
          scrollToTime={new Date()}
          defaultDate={new Date()}
          onSelectEvent={eventToRemove => this.setState({ eventToRemove })}
          onSelectSlot={this.addRange}
          showMultiDayTimes={false}
          min={moment(this.props.startTime).minutes(0).toDate()}
          max={
            this.props.endTime.getMinutes() > 0 ?
              moment(this.props.endTime).add(1, 'h').minutes(0).toDate() :
              this.props.endTime
          }
          formats={{
            dayFormat: (date) =>
              moment(date).format('MM/DD'),
            timeGutterFormat: (date) =>
              moment(date).format(timeFormat),
            selectRangeFormat: ({start, end}) =>
              moment(start).format(timeFormat) + " - " + moment(end).format(timeFormat)
          }}
          onSelecting={() => {
            if(!this.state.touchMoveLocked) {
              this.setState({ touchMoveLocked: true });
            }
          }}
          step={this.props.precise ? 5 : 30}
          timeslots={this.props.precise ? 12 : 2}
          components={{ eventWrapper: this.getEventWrapper.bind(this) }}
        />

        <Dialog
          open={this.state.eventToRemove != null}
          onClose={() => this.setState({ eventToRemove: null })}
        >
          <DialogTitle><Translate value="event.releaseBlockedHours" /></DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Translate value="event.releaseBlockedHoursMessage" />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ eventToRemove: null })}
              color="secondary"
            >
              <Translate value="common.no" />
            </Button>
            <Button
              onClick={() => {
                let events = this.state.events.slice();
                events.splice(events.indexOf(this.state.eventToRemove), 1);
                this.setState({ events, eventToRemove: null });
              }}
              color="primary"
              autoFocus
            >
              <Translate value="common.yes" />
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }
}

TimeRangePicker.propTypes = {
  startTime: PropTypes.instanceOf(Date),
  endTime: PropTypes.instanceOf(Date),
  precise: PropTypes.bool,
  ranges: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRangesChange: PropTypes.func,
  rangeTitle: PropTypes.string,
  maxWidth: PropTypes.number,
  maxHeight: PropTypes.number,
  mode24Hours: PropTypes.bool,
};

export default TimeRangePicker;
