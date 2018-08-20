import React from "react";
import PropTypes from "prop-types";
import moment from 'moment'

import "./events-builder.css";
import { isMobile } from 'react-device-detect';
import BigCalendar from "react-big-calendar";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

const EventsBuilder = (props) => {
  let touchMoveLocked = false;
  let calendar = null;

  function isValidProps() {
    return moment(props.startTime).isBefore(moment(props.endTime));
  }

  function getAvailableEvents() {
    let events = props.events.slice().map(e => Object.assign({}, e));

    events = events.filter(e => moment(e.end).isAfter(moment(props.startTime)) &&
      moment(e.start).isBefore(moment(props.endTime)));

    events.forEach(event => {
      if(moment(event.start).isBefore(moment(props.startTime))) {
        event.start = props.startTime;
      }
      if(moment(event.end).isAfter(moment(props.endTime))) {
        event.end = props.endTime;
      }
    });

    return events;
  }

  function getUnavailableEvents() {
    let events = [];

    if(props.startTime.getMinutes() !== 0) {
      events.push({
        start: moment(props.startTime).minutes(0).toDate(),
        end: props.startTime,
        unavailable: true
      });
    }

    if(props.endTime.getMinutes() !== 0) {
      events.push({
        start: props.endTime,
        end: moment(props.endTime).add(1, 'h').minutes(0).toDate(),
        unavailable: true
      });
    }

    return events;
  }

  function merge(events, newEvent) {
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

  function addEvent({ start, end }) {
    let startDate = moment(start).seconds(0).milliseconds(0);
    let endDate = moment(end).seconds(0).milliseconds(0);

    if(isMobile && touchMoveLocked) {
      calendar.style.overflowY = props.maxHeight ? "scroll" : "auto";
      document.body.style.overflowY = "scroll";
      touchMoveLocked = false;
    }

    if(startDate.isSameOrAfter(moment(props.endTime))) {
      return;
    }

    getUnavailableEvents().forEach(event => {
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

    props.onEventsUpdated(merge(props.events, { start: startDate.toDate(), end: endDate.toDate() }));
  }

  function getEventWrapper(data) {
    const date = moment(data.event.start).format(props.timeFormat) + " - " + moment(data.event.end).format(props.timeFormat);
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

  function getDayWrapper() {
    return (
      <div style={{height: props.precise ? "5px" : "30px"}} className="rbc-time-slot" />
    );
  }

  const {
    startTime,
    endTime,
    precise,
    events,
    onEventsUpdated,
    onRemoveEvent,
    eventsTitle,
    maxHeight,
    timeFormat,
    style,
    ...other
  } = props;

  if (isValidProps()) {
    const availableEvents = getAvailableEvents().map(e => ({start: e.start, end: e.end}));

    if(onEventsUpdated && JSON.stringify(events) !== JSON.stringify(availableEvents)) {
      onEventsUpdated(events);
    }

    return (
      <div
        ref={obj => calendar = obj}
        style={Object.assign({
          maxHeight: maxHeight ? maxHeight + "px" : "100%",
          overflowY: maxHeight ? "scroll" : "auto",
          width: "100%",
        }, style)}
        {...other}
      >
        <BigCalendar
          ref={obj => calendar = obj}
          selectable
          events={availableEvents.map(r => ({...r, title: eventsTitle || ""})).concat(getUnavailableEvents())}
          defaultView={BigCalendar.Views.DAY}
          views={['day']}
          toolbar={false}
          scrollToTime={new Date()}
          defaultDate={new Date()}
          onSelectEvent={event => {
            if (onRemoveEvent) {
              onRemoveEvent(event)
            }
          }}
          onSelectSlot={addEvent}
          showMultiDayTimes={false}
          min={moment(startTime).minutes(0).toDate()}
          max={endTime.getMinutes() > 0 ?
            moment(props.endTime).add(1, 'h').minutes(0).toDate() :
            props.endTime}
          formats={{
            dayFormat: (date) =>
              moment(date).format('MM/DD'),
            timeGutterFormat: (date) =>
              moment(date).format(timeFormat.toString()),
            selectRangeFormat: ({start, end}) =>
              moment(start).format(timeFormat.toString()) + " - " + moment(end).format(timeFormat.toString())
          }}
          onSelecting={() => {
            if (isMobile && !touchMoveLocked) {
              calendar.style.overflowY = maxHeight ? "hidden" : "auto";
              document.body.style.overflowY = "hidden";
              touchMoveLocked = true;
            }
          }}
          step={precise ? 5 : 30}
          timeslots={precise ? 12 : 2}
          components={{eventWrapper: getEventWrapper, dayWrapper: getDayWrapper}}
        />
      </div>
    );
  } else {
    return <div/>;
  }


};

EventsBuilder.propTypes = {
  startTime: PropTypes.instanceOf(Date),
  endTime: PropTypes.instanceOf(Date),
  precise: PropTypes.bool,
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEventsUpdated: PropTypes.func.isRequired,
  onRemoveEvent: PropTypes.func,
  eventsTitle: PropTypes.string,
  maxHeight: PropTypes.number,
  timeFormat: PropTypes.string,
  style: PropTypes.object
};

export default EventsBuilder;
