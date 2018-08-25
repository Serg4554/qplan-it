import React from "react";
import PropTypes from "prop-types";
import moment from 'moment'

import "./events-builder.css";
import { isMobile } from 'react-device-detect';
import BigCalendar from "react-big-calendar";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment));

function getNeutralMoment(date, hours = null, minutes = null) {
  const h = hours !== null ? hours : (date instanceof Date ? date.getHours() : date.hours()) ;
  const m = minutes !== null ? minutes : (date instanceof Date ? date.getMinutes() : date.minutes());
  return moment().startOf('day').hours(h).minutes(m);
}

const EventsBuilder = (props) => {
  const dayStart = moment().startOf('day');
  const dayEnd = getNeutralMoment(moment(dayStart).add(Math.ceil(props.duration / 5) * 5, 'm'));
  if(dayEnd.isSame(dayStart)) {
    dayEnd.endOf('day');
  }
  const offset = Math.ceil(Math.floor(getNeutralMoment(props.start).diff(dayStart) / 60000) / 5) * 5;

  let touchMoveLocked = false;
  let calendar = null;

  function toEvents(periods) {
    let events = [];

    let start, end;
    periods.forEach(period => {
      start = getNeutralMoment(period.start).subtract(offset, 'm');
      end = moment(start).add(Math.ceil(period.duration / 5) * 5, 'm');
      end = moment(start).hours(end.hours()).minutes(end.minutes());
      events.push({
        start: start.toDate(),
        end: end.isSame(dayStart) ? moment().endOf('day').toDate() : end.toDate()
      });
    });

    return events;
  }

  function toPeriods(events) {
    let periods = [];

    events.forEach(event => {
      periods.push({
        start: getNeutralMoment(event.start).add(offset, 'm').toDate(),
        duration: Math.ceil(getNeutralMoment(event.end).diff(getNeutralMoment(event.start)) / 60000 / 5) * 5
      });
    });

    return periods;
  }

  function getDisabledEvents() {
    let events = [];

    const end = moment().endOf('day');
    if(dayEnd.minutes() !== 0 && !dayEnd.isSame(end)) {
      events.push({
        start: dayEnd.toDate(),
        end: end.toDate(),
        unavailable: true
      });
    }

    return events;
  }

  function merge(events, newEvent) {
    let mergedEvents = events.map(e => ({start: getNeutralMoment(e.start), end: getNeutralMoment(e.end)}));
    let start = getNeutralMoment(newEvent.start);
    let end = getNeutralMoment(newEvent.end);

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

    return mergedEvents.map(e => ({
      start: e.start.toDate(),
      end: e.end.toDate()
    }));
  }

  function addEvent({ start, end }) {
    let startEvent = moment(start).seconds(0).milliseconds(0);
    let endEvent = moment(end).seconds(0).milliseconds(0);

    if(isMobile && touchMoveLocked) {
      calendar.style.overflowY = props.maxHeight ? "scroll" : "auto";
      document.body.style.overflowY = "scroll";
      touchMoveLocked = false;
    }

    if(startEvent.isSameOrAfter(dayEnd)) {
      return;
    }

    getDisabledEvents().forEach(event => {
      const disabledStart = moment(event.start);
      const disabledEnd = moment(event.end);
      if(startEvent.isSame(disabledStart) || startEvent.isBetween(disabledStart, disabledEnd)) {
        startEvent = disabledEnd;
      }
      if(endEvent.isSame(disabledEnd) || endEvent.isBetween(disabledStart, disabledEnd)) {
        endEvent = startEvent.isBefore(disabledStart) ? disabledStart : disabledEnd;
      }
    });

    if(startEvent.isSame(endEvent)) {
      return;
    }

    const events = merge(toEvents(props.periods), { start: startEvent.toDate(), end: endEvent.toDate() });
    props.onPeriodsUpdated(toPeriods(events));
  }

  function getEventWrapper(data) {
    const start = moment(data.event.start).add(offset, 'm');
    const end = moment(data.event.end).add(offset, 'm');
    end.minutes(Math.ceil(end.minutes() / 5) * 5);

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

  return (
    <div
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
        events={toEvents(props.periods).map(e => ({...e, title: props.eventsTitle || ""})).concat(getDisabledEvents())}
        defaultView={BigCalendar.Views.DAY}
        views={['day']}
        toolbar={false}
        defaultDate={new Date()}
        onSelectEvent={event => { if(props.onRemovePeriod) props.onRemovePeriod(toPeriods([event])[0]) }}
        onSelectSlot={addEvent}
        showMultiDayTimes={false}
        min={dayStart.toDate()}
        max={
          dayEnd.minutes() === 0 ? moment(dayEnd).minutes(0).toDate() :
            (dayEnd.isBefore(moment().hours(23).minutes(0)) ?
              moment(dayEnd).minutes(0).add(1, 'h').toDate() :
              moment().endOf('day').toDate())}
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
  onRemovePeriod: PropTypes.func,
  eventsTitle: PropTypes.string,
  maxHeight: PropTypes.number,
  timeFormat: PropTypes.string,
  style: PropTypes.object
};

export default EventsBuilder;
