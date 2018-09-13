import React from "react";
import PropTypes from 'prop-types'
import moment from 'moment'

import EventsBuilder from "./EventsBuilder";


class EventCalendar extends React.Component {
  constructor(props) {
    super(props);

    this.state = this.getCalendarStatus();
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextProps.days) !== JSON.stringify(this.props.days) ||
      JSON.stringify(nextState.days) !== JSON.stringify(this.state.days) ||
      JSON.stringify(nextProps.periods) !== JSON.stringify(this.props.periods);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(JSON.stringify(prevProps.days) !== JSON.stringify(this.props.days)) {
      this.setState(this.getCalendarStatus())
    }
  }

  getTiming() {
    if(!this.props.days || this.props.days.length === 0) {
      return {minDate: null, maxDate: null, duration: 0};
    }

    const current = moment().startOf('day');
    const minDate = new Date(Math.min.apply(null, this.props.days.map(day =>
      moment(current).hours(day.period.start.getHours()).minutes(day.period.start.getMinutes()).toDate()).concat(
      this.props.days.map(day => {
        let end = moment(day.period.start).add(day.period.duration, 'm');
        if(end.isAfter(moment(day.period.start).endOf('day'))) {
          return moment(current).startOf('day');
        } else {
          return moment(current).hours(end.hours()).minutes(end.minutes()).toDate();
        }
      })
    )));
    let maxDate = new Date(Math.max.apply(null, this.props.days.map(day => {
      const end = moment(current).hours(day.period.start.getHours()).minutes(day.period.start.getMinutes())
        .add(day.period.duration, 'm');
      const tomorrow = moment(current).add(1, 'd');
      return end.isAfter(tomorrow) ? tomorrow : end;
    })));
    const duration = moment(maxDate).diff(minDate) / 60000;

    return {minDate, maxDate, duration};
  }

  getCalendarStatus() {
    if(!this.props.days || this.props.days.length === 0) {
      return {};
    }

    let {minDate, maxDate, duration} = this.getTiming();

    let days = [];
    this.props.days.forEach(({period, blockedPeriods}, index) => {
      const day = {period, blockedPeriods};

      const calendarStart = moment(day.period.start).hours(minDate.getHours()).minutes(minDate.getMinutes()).toDate();
      if(moment(maxDate).isAfter(moment(minDate).endOf('day'))) {
        maxDate = moment(minDate).endOf('day').toDate();
      }
      const calendarEnd = moment(day.period.start).hours(maxDate.getHours()).minutes(maxDate.getMinutes()).toDate();
      day.blockedPeriods.forEach(blockedPeriod => {
        blockedPeriod.className = "rbc-event-unavailable";
      });

      // BlockedPeriods to adjust start and end hour in calendar
      const yest = index > 0 ? this.props.days[index - 1] : undefined;
      const yestEnd = yest ? moment(yest.period.start).add(yest.period.duration, 'm') : calendarStart;
      const realStart = moment(yestEnd).isAfter(calendarStart) ? yestEnd.toDate() : calendarStart;
      let realDiff = moment(day.period.start).diff(realStart) / 60000;
      if(realDiff > 0) {
        day.blockedPeriods.push({
          start: realStart,
          duration: realDiff,
          className: "rbc-event-unavailable"
        });
      }
      const dayEnd = moment(day.period.start).add(day.period.duration, 'm').toDate();
      realDiff = moment(calendarEnd).diff(dayEnd) / 60000;
      if(realDiff > 0) {
        day.blockedPeriods.push({
          start: dayEnd,
          duration: realDiff,
          className: "rbc-event-unavailable"
        });
      }

      // BlockedPeriods from yesterday
      const lastDayEnd = index > 0 ?
        moment(this.props.days[index - 1].period.start).add(this.props.days[index - 1].period.duration, 'm') :
        undefined;
      if(lastDayEnd && lastDayEnd.isAfter(calendarStart)) {
        let yestBlockedPeriods = this.props.days[index - 1].blockedPeriods.map(p => ({...p}));
        yestBlockedPeriods = yestBlockedPeriods.filter(p => {
          const blockedEnd = moment(p.start).add(p.duration, 'm');
          return blockedEnd.isAfter(calendarStart);
        });
        yestBlockedPeriods.forEach(p => {
          p.className = "rbc-event-unavailable";
        });
        day.blockedPeriods = day.blockedPeriods.concat(yestBlockedPeriods);
      }
      days.push(day);
    });

    return {
      minDate,
      maxDate,
      duration,
      days
    };
  }

  render() {
    if(!this.state.days || this.state.days.length === 0) {
      return <div />;
    } else {
      return (
        <div style={{border: "1px solid #d8d8d8", borderRadius: "4px"}} className="eventCalendar">
          {this.state.days.map(({period, blockedPeriods}, index) => {
            const timeWidth = 57;
            const offset = timeWidth / this.state.days.length;
            const percentage = 100 / this.state.days.length;
            return (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  width: "calc(" + percentage + "%" +
                    (index === 0 ? " + " + (timeWidth - offset) : " - " + offset) + "px)",
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
                  start={moment(period.start)
                    .hours(this.state.minDate.getHours())
                    .minutes(this.state.minDate.getMinutes())
                    .toDate()}
                  duration={this.state.duration}
                  precise={false}
                  periods={blockedPeriods.concat(this.props.periods.filter(p =>
                    moment(p.start).startOf('day').isSame(moment(period.start).startOf('day'))))}
                  onPeriodsUpdated={periods => {
                    const newPeriods = periods.filter(period => !period.className);
                    if(newPeriods.length > 0) {
                      this.props.onPeriodsUpdated(periods);
                    }
                  }}
                  onSelectPeriod={period => this.props.onSelectPeriod(period)}
                  timeFormat={"HH:mm"}
                  hideHours={index !== 0}
                  style={{textAlign: "center"}}
                />
              </div>
            );
          })}
        </div>
      );
    }
  }
}

EventCalendar.propTypes = {
  days: PropTypes.arrayOf(PropTypes.object),
  periods: PropTypes.arrayOf(PropTypes.object),
  onPeriodsUpdated: PropTypes.func.isRequired,
  onSelectPeriod: PropTypes.func.isRequired,
};

export default EventCalendar;
