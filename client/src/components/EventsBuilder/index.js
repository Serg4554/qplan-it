import React from "react";
import PropTypes from "prop-types";
import moment from 'moment'

import "./events-builder.css";
import { isMobile } from 'react-device-detect';
import BigCalendar from "react-big-calendar";
import Tooltip from '@material-ui/core/Tooltip';
import WarningIcon from '@material-ui/icons/Warning';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

const EventsBuilder = (props) => {
  function getNeutralMoment(date, hours = null, minutes = null) {
    const h = hours !== null ? hours : (date instanceof Date ? date.getHours() : date.hours()) ;
    const m = minutes !== null ? minutes : (date instanceof Date ? date.getMinutes() : date.minutes());
    return moment(props.start).startOf('day').hours(h).minutes(m);
  }

  // Component variables
  const dayStart = moment(props.start).startOf('day');
  const dayEnd = getNeutralMoment(moment(dayStart).add(Math.ceil(props.duration / 5) * 5, 'm'));
  if(dayEnd.isSame(dayStart)) {
    dayEnd.endOf('day');
  }
  const offset = Math.ceil(Math.floor(getNeutralMoment(props.start).diff(dayStart) / 60000) / 5) * 5;
  let touchMoveLocked = false;
  let calendar = null;

  // Available events
  const availableEvents = toEvents(props.periods.filter(p => p.className !== "rbc-event-unavailable"))
    .map(e => ({...e, title: props.eventsTitle || ""}));

  // Unavailable events
  let unavailableEvents = toEvents(props.periods.filter(p => p.className === "rbc-event-unavailable"));
  if(dayEnd.minutes() !== 0 && !dayEnd.isSame(moment(dayStart).endOf('day'))) {
    unavailableEvents.push({
      start: dayEnd.toDate(),
      end: moment(dayStart).endOf('day').toDate(),
      className: "rbc-event-unavailable",
    });
  }

  function toEvents(periods) {
    let events = [];

    let start, end;
    periods.forEach(period => {
      if(moment(period.start).isBefore(dayStart)) {
        start = dayStart;
        end = moment(period.start).add(Math.ceil(period.duration / 5) * 5, 'm');
      } else {
        start = moment(period.start).subtract(offset, 'm');
        end = moment(start).add(Math.ceil(period.duration / 5) * 5, 'm');
      }
      if(end.isAfter(moment(dayStart).endOf('day'))) {
        end = moment(dayStart).endOf('day');
      }
      events.push({
        start: start.toDate(),
        end: end.toDate(),
        className: period.className,
        message:  period.message
      });
    });

    return events;
  }

  function toPeriods(events) {
    let periods = [];

    events.forEach(event => {
      const currEvent = availableEvents.find(e => moment(e.start).isSame(moment(event.start)));
      periods.push({
        start: getNeutralMoment(event.start).add(offset, 'm').toDate(),
        duration: Math.ceil(getNeutralMoment(event.end).diff(getNeutralMoment(event.start)) / 60000 / 5) * 5,
        className: currEvent ? currEvent.className : undefined,
        message:  currEvent ? currEvent.message : undefined
      });
    });

    return periods;
  }

  function merge(events, newEvent) {
    let mergedEvents = events.map(e => {
      const currEvent = availableEvents.find(currEvent => moment(currEvent.start).isSame(moment(e.start)));
      return {
        start: getNeutralMoment(e.start),
        end: getNeutralMoment(e.end),
        className: currEvent ? currEvent.className : undefined,
        message: currEvent ? currEvent.message : undefined
      }
    });
    let start = getNeutralMoment(newEvent.start);
    let end = getNeutralMoment(newEvent.end);
    mergedEvents = mergedEvents.filter(events => events.className !== "rbc-event-unavailable" &&
      events.className === newEvent.className);

    let eventsToMerge = mergedEvents.filter(e => (e.end.isSameOrAfter(start) && end.isSameOrAfter(e.start)) ||
      (e.start.isSameOrBefore(end) && start.isSameOrBefore(e.end)));

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

    return mergedEvents.map(e => ({
      start: e.start.toDate(),
      end: e.end.toDate(),
      className: e.className,
      message: e.message
    }));
  }

  function addEvent({ start, end }, events) {
    let eventStart = moment(start).seconds(0).milliseconds(0);
    let eventEnd = moment(end).seconds(0).milliseconds(0);

    if(eventStart.isSameOrAfter(dayEnd)) {
      return events;
    }

    let split = false;
    for(let i = 0; i < unavailableEvents.length; i++) {
      const disabledStart = moment(unavailableEvents[i].start);
      const disabledEnd = moment(unavailableEvents[i].end);

      if(eventEnd.isSame(disabledEnd) || eventEnd.isBetween(disabledStart, disabledEnd)) {
        eventEnd = eventStart.isBefore(disabledStart) ? disabledStart : disabledEnd;
      }
      if(eventStart.isSame(disabledStart) || eventStart.isBetween(disabledStart, disabledEnd)) {
        eventStart = disabledEnd;
      }
      if(disabledStart.isAfter(eventStart) && disabledEnd.isBefore(eventEnd)) {
        split = true;
        const topEvent = { start: eventStart.toDate(), end: disabledStart.toDate() };
        const bottomEvent = { start: disabledEnd.toDate(), end: eventEnd.toDate() };
        events = addEvent(bottomEvent, addEvent(topEvent, events));
        break;
      }
    }
    if(split || eventStart.isSame(eventEnd)) {
      return events;
    } else {
      return merge(events, { start: eventStart.toDate(), end: eventEnd.toDate() })
    }
  }

  function getEventWrapper(data) {
    const start = moment(data.event.start).add(offset, 'm');
    const end = moment(data.event.end).add(offset, 'm');
    end.minutes(Math.ceil(end.minutes() / 5) * 5);

    const date = start.format(props.timeFormat) + " - " + end.format(props.timeFormat);
    const diff = end.diff(start) / 60000;

    let warningMessage;
    if(data.event.className === "rbc-event-warning") {
      warningMessage = (
        <Tooltip
          title={data.event.message}
          placement="right"
          disableFocusListener
        >
          <WarningIcon
            style={{
              position: "absolute",
              right: (diff < 60 ? 3 : 8) + "px",
              top: (diff < 60 ? 3 : 8) + "px",
              fontSize: (diff < 60 ? 8 : 12) + "pt",
              color: "#FFC107",
              display: diff > 10 ? "block" : "none"
            }}
          />
        </Tooltip>
      );
    }

    return (
      <div
        className={data.children.props.className + (data.event.className ? " " + data.event.className : "")}
        style={data.children.props.style}
        onClick={data.event.className !== "rbc-event-unavailable" ? () => data.children.props.onClick() : undefined}
      >
        {warningMessage}
        <div
          className="rbc-event-label"
          style={{fontSize: (diff < 60 ? 7 : 8) + "pt"}}
        >
          {diff > 10 && data.event.className !== "rbc-event-unavailable" ? date : ""}
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
      <div
        style={{height: props.precise ? "5px" : "30px"}}
        className="rbc-time-slot"
      />
    );
  }

  return (
    <div
      className={props.hideHours ? "calendar-hide-hours" : ""}
      ref={obj => calendar = obj}
      style={Object.assign({
        maxHeight: props.maxHeight ? props.maxHeight + "px" : "100%",
        overflowY: props.maxHeight ? "scroll" : "auto",
        width: "100%",
      }, props.style)}
    >
      <BigCalendar
        ref={obj => calendar = obj}
        selectable
        events={availableEvents.concat(unavailableEvents)}
        defaultView={BigCalendar.Views.DAY}
        views={['day']}
        toolbar={false}
        date={dayStart.toDate()}
        onNavigate={() => {}}
        onSelectEvent={event => { if(props.onSelectPeriod) props.onSelectPeriod(toPeriods([event])[0]) }}
        onSelectSlot={event => {
          if(isMobile && touchMoveLocked) {
            calendar.style.overflowY = props.maxHeight ? "scroll" : "auto";
            document.body.style.overflowY = "scroll";
            touchMoveLocked = false;
          }
          props.onPeriodsUpdated(toPeriods(addEvent(event, availableEvents)));
        }}
        showMultiDayTimes={false}
        longPressThreshold={150}
        min={dayStart.toDate()}
        max={
          dayEnd.minutes() === 0 ? moment(dayEnd).minutes(0).toDate() :
            (dayEnd.isBefore(moment(dayStart).hours(23).minutes(0)) ?
              moment(dayEnd).minutes(0).add(1, 'h').toDate() :
              moment(dayStart).endOf('day').toDate())}
        formats={{
          timeGutterFormat: (date) =>
            moment(date).add(offset, 'm').format(props.timeFormat),
          selectRangeFormat: ({start, end}) => {
            const _start = moment(start).add(offset, 'm');
            const _end = moment(end).add(offset, 'm');
            _end.minutes(Math.ceil(_end.minutes() / 5) * 5);
            return _start.format(props.timeFormat) + " - " + _end.format(props.timeFormat);
          }
        }}
        onSelecting={() => {
          if (isMobile && !touchMoveLocked) {
            calendar.style.overflowY = props.maxHeight ? "hidden" : "auto";
            document.body.style.overflowY = "hidden";
            touchMoveLocked = true;
          }
        }}
        step={props.precise ? 5 : 30}
        timeslots={props.precise ? 12 : 2}
        components={{eventWrapper: getEventWrapper, dayWrapper: getDayWrapper}}
      />
    </div>
  );
};

EventsBuilder.propTypes = {
  start: PropTypes.instanceOf(Date).isRequired,
  duration: PropTypes.number.isRequired,
  periods: PropTypes.arrayOf(PropTypes.object).isRequired,
  precise: PropTypes.bool,
  onPeriodsUpdated: PropTypes.func.isRequired,
  onSelectPeriod: PropTypes.func,
  eventsTitle: PropTypes.string,
  maxHeight: PropTypes.number,
  timeFormat: PropTypes.string,
  hideHours: PropTypes.bool,
  style: PropTypes.object
};

export default EventsBuilder;
