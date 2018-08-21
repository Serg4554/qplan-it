import React from "react";
import PropTypes from "prop-types";
import moment from 'moment'

import "./events-builder.css";
import { isMobile } from 'react-device-detect';
import BigCalendar from "react-big-calendar";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

export const getAvailableEvents = (startTime, endTime, events) => {
  let availableEvents = events.slice().map(e => ({...e}));

  availableEvents = availableEvents.filter(e => moment(e.end).isAfter(moment(startTime)) &&
    moment(e.start).isBefore(moment(endTime)));

  availableEvents.forEach(event => {
    if(moment(event.start).isBefore(moment(startTime))) {
      event.start = startTime;
    }
    if(moment(event.end).isAfter(moment(endTime))) {
      event.end = endTime;
    }
  });

  return availableEvents;
};

const EventsBuilder = (props) => {
  let touchMoveLocked = false;
  let calendar = null;

  function isValidProps() {
    return moment(props.startTime).isBefore(moment(props.endTime));
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
    const start = moment(data.event.start);
    const end = moment(data.event.end);
    const date = start.format(props.timeFormat) + " - " + end.format(props.timeFormat);
    const unavailableClassName = data.event.unavailable ? " rbc-event-unavailable" : "";
    const diff = end.diff(start) / 60000;

    return (
      <div
        className={data.children.props.className + unavailableClassName}
        style={data.children.props.style}
        onClick={!data.event.unavailable ? () => data.children.props.onClick() : undefined}
      >
        <div
          className="rbc-event-label"
          style={{fontSize: (diff < 60 ? 7 : 8) + "pt"}}
        >
          {diff > 10 && !data.event.unavailable ? date : ""}
        </div>
        <div
          className="rbc-event-content"
          style={{fontSize: (diff < 60 ? 10 : 15) + "pt"}}
        >
          {diff >= 30 ? data.event.title : ""}
        </div>
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
    onRemoveEvent,
    eventsTitle,
    maxHeight,
    timeFormat,
    style
  } = props;

  if (isValidProps()) {
    return (
      <div
        ref={obj => calendar = obj}
        style={Object.assign({
          maxHeight: maxHeight ? maxHeight + "px" : "100%",
          overflowY: maxHeight ? "scroll" : "auto",
          width: "100%",
        }, style)}
      >
        <BigCalendar
          ref={obj => calendar = obj}
          selectable
          events={getAvailableEvents(startTime, endTime, events)
            .map(e => ({...e, title: eventsTitle || ""}))
            .concat(getUnavailableEvents())}
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
