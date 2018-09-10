import React from "react";
import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import PropTypes from 'prop-types'
import moment from 'moment'

import EventsBuilder from "./EventsBuilder";


const mapStateToProps = state => {
  return {
    days: state.event.days
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({

}, dispatch);

const EventCalendar = (props) => {

  function onPeriodsUpdated(periods) {
    const newPeriods = periods.filter(period => !period.className);
    if(newPeriods.length > 0) {
      console.log(newPeriods);
    }
  }

  if(!props.days || props.days.length === 0) {
    return <div />;
  }

  let days = props.days.sort((a, b) => a.period.start - b.period.start).slice(0, 7);
  for(let i = days.length - 1; i >= 0 ; i--) {
    const start = moment(days[i].period.start);
    let end = moment(start).add(days[i].period.duration, 'm');
    if(end.isSame(moment(start).startOf('day').add(1, 'd'))) {
      end = moment(start).endOf('day')
    }

    const tomStart = days[i + 1] ? moment(days[i + 1].period.start).startOf('day') : moment(end).add(2, 'd');
    if(end.isAfter(moment(start).endOf('day')) && end.isBefore(tomStart)) {
      days.splice(i + 1, 0, {
        period: {
          start: moment(end).startOf('day').toDate(),
          duration: end.diff(moment(end).startOf('day')) / 60000
        },
        blockedPeriods: []
      });
    }
  }
  days = days.slice(0, 7);

  const current = moment().startOf('day');
  const minDate = new Date(Math.min.apply(null, days.map(day =>
    moment(current).hours(day.period.start.getHours()).minutes(day.period.start.getMinutes()).toDate()).concat(
    days.map(day => {
      let end = moment(day.period.start).add(day.period.duration, 'm');
      if(end.isAfter(moment(day.period.start).endOf('day'))) {
        return moment(current).startOf('day');
      } else {
        return moment(current).hours(end.hours()).minutes(end.minutes()).toDate();
      }
    })
  )));
  let maxDate = new Date(Math.max.apply(null, days.map(day => {
    const end = moment(current).hours(day.period.start.getHours()).minutes(day.period.start.getMinutes())
      .add(day.period.duration, 'm');
    const tomorrow = moment(current).add(1, 'd');
    return end.isAfter(tomorrow) ? tomorrow : end;
  })));
  const duration = moment(maxDate).diff(minDate) / 60000;

  return (
    <div
      style={{margin: "14px auto 0 auto", maxWidth: "1000px", border: "1px solid #d8d8d8", borderRadius: "4px"}}
      className="eventCalendar"
    >
      {days.map(({period, blockedPeriods}, index) => {
        const calendarStart = moment(period.start).hours(minDate.getHours()).minutes(minDate.getMinutes()).toDate();
        if(moment(maxDate).isAfter(moment(minDate).endOf('day'))) {
          maxDate = moment(minDate).endOf('day').toDate();
        }
        const calendarEnd = moment(period.start).hours(maxDate.getHours()).minutes(maxDate.getMinutes()).toDate();
        blockedPeriods.forEach(blockedPeriod => {
          blockedPeriod.className = "rbc-event-unavailable";
        });

        // BlockedPeriods to adjust start and end hour in calendar
        const yest = index > 0 ? days[index - 1] : undefined;
        const yestEnd = yest ? moment(yest.period.start).add(yest.period.duration, 'm') : calendarStart;
        const realStart = moment(yestEnd).isAfter(calendarStart) ? yestEnd.toDate() : calendarStart;
        let realDiff = moment(period.start).diff(realStart) / 60000;
        if(realDiff > 0) {
          blockedPeriods.push({
            start: realStart,
            duration: realDiff,
            className: "rbc-event-unavailable"
          });
        }
        const dayEnd = moment(period.start).add(period.duration, 'm').toDate();
        realDiff = moment(calendarEnd).diff(dayEnd) / 60000;
        if(realDiff > 0) {
          blockedPeriods.push({
            start: dayEnd,
            duration: realDiff,
            className: "rbc-event-unavailable"
          });
        }

        // BlockedPeriods from yesterday
        const lastDayEnd = index > 0 ?
          moment(days[index - 1].period.start).add(days[index - 1].period.duration, 'm') :
          undefined;
        if(lastDayEnd && lastDayEnd.isAfter(calendarStart)) {
          let yestBlockedPeriods = days[index - 1].blockedPeriods.map(p => ({...p}));
          yestBlockedPeriods = yestBlockedPeriods.filter(p => {
            const blockedEnd = moment(p.start).add(p.duration, 'm');
            return blockedEnd.isAfter(calendarStart);
          });
          yestBlockedPeriods.forEach(p => {
            p.className = "rbc-event-unavailable";
          });
          blockedPeriods = blockedPeriods.concat(yestBlockedPeriods);
        }

        const timeWidth = 57;
        const offset = timeWidth / days.length;
        const percentage = 100 / days.length;
        return (
          <div
            key={index}
            style={{
              display: "inline-block",
              width: "calc(" + percentage + "%" + (index === 0 ? " + " + (timeWidth - offset) : " - " + offset) + "px)",
              textAlign: "right"
            }}
          >
            <div style={{
              textAlign: "center",
              width: index === 0 ? "calc(100% - 57px)" : "100%",
              display: "inline-block",
              borderBottom: "1px solid #d8d8d8"
            }}>
              <span style={{fontWeight: "bold"}}>{moment(period.start).format("D")}</span>
              <br/>
              <span style={{fontWeight: "lighter"}}>{moment(period.start).format("MMM")}</span>
            </div>
            <EventsBuilder
              start={calendarStart}
              duration={duration}
              precise={false}
              periods={blockedPeriods}
              onPeriodsUpdated={onPeriodsUpdated.bind(this)}
              onSelectPeriod={period => {}}
              timeFormat={"HH:mm"}
              hideHours={index !== 0}
            />
          </div>
        );
      })}
    </div>
  );
};

EventCalendar.propTypes = {
  days: PropTypes.arrayOf(PropTypes.object)
};

export default connect(mapStateToProps, mapDispatchToProps)(EventCalendar);
