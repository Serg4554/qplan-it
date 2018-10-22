import React from "react";
import PropTypes from "prop-types";
import moment from 'moment';

import Typography from "@material-ui/core/Typography";
import {I18n, Translate} from "react-redux-i18n";
import TimeInput from "material-ui-time-picker";
import Tooltip from "@material-ui/core/Tooltip";
import Button from "@material-ui/core/Button";
import GpsNotFixed from "../../node_modules/@material-ui/icons/GpsNotFixed";
import GpsFixedIcon from "../../node_modules/@material-ui/icons/GpsFixed";
import Paper from "@material-ui/core/Paper";
import EventsBuilder from "./EventsBuilder";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import Avatar from "@material-ui/core/Avatar";
import WarningIcon from '@material-ui/icons/Warning';
import ArrowRightAltIcon from '@material-ui/icons/ArrowRightAlt';


class TimeRangePicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      periodToRemove: null,
      precise: !!props.preciseByDefault,
      showBlockedPeriods: false
    }
  }

  getFixedBlockedPeriods(period, blockedPeriods) {
    const safeBlockedPeriods = blockedPeriods.map(p => ({...p}));
    const periodStart = moment(period.start);

    let blockedStart, excess;
    safeBlockedPeriods.forEach(blocked => {
      blockedStart = moment(blocked.start);
      if(blockedStart.isBefore(periodStart)) {
        blocked.start = periodStart.toDate();
        blocked.duration = blocked.duration - periodStart.diff(blockedStart) / 60000;
      }
      excess = (blockedStart.diff(periodStart) / 60000) + blocked.duration - (period.duration || 1440);
      if(blocked.duration > 0 && excess > 0) {
        blocked.duration = blocked.duration - excess;
      }
    });

    return safeBlockedPeriods.filter(blocked => blocked.duration > 0);
  }

  removeEventDialog() {
    const day = this.props.day;

    return (
      <Dialog
        open={this.state.periodToRemove != null}
        onClose={() => this.setState({ periodToRemove: null })}
      >
        <DialogTitle><Translate value="createEvent.releaseBlockedHours"/></DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Translate value="createEvent.releaseBlockedHoursMessage"/>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => this.setState({ periodToRemove: null })}
            color="secondary"
          >
            <Translate value="common.no"/>
          </Button>
          <Button
            onClick={() => {
              if(this.state.periodToRemove) {
                let periods = day.blockedPeriods.slice();
                const index = periods.findIndex(p => p.start.getTime() === this.state.periodToRemove.start.getTime());
                if(index !== -1) {
                  periods.splice(index, 1);
                  this.setState({ periodToRemove: null });
                  this.props.onDayUpdated({ complete: day.complete, period: day.period, blockedPeriods: periods });
                }
              }
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
    if(this.state.showBlockedPeriods) {
      let periods = this.props.day.blockedPeriods.map(p => ({...p}));
      if(this.props.yesterday) {
        const yestStart = moment(this.props.yesterday.period.start);
        let yestEnd = moment(yestStart).add(this.props.yesterday.period.duration || 1440, 'm');
        if(yestEnd.isSame(moment(this.props.day.period.start).startOf('day'))) {
          yestEnd = yestStart.endOf('day');
        }
        if(yestEnd.isAfter(this.props.day.period.start)) {
          let yestBlockedPeriods = this.props.yesterday.blockedPeriods.map(p => ({...p}));
          yestBlockedPeriods = yestBlockedPeriods.filter(p => {
            const blockedEnd = moment(p.start).add(p.duration, 'm');
            return blockedEnd.isAfter(this.props.day.period.start);
          });
          yestBlockedPeriods.forEach(p => {
            p.message = I18n.t("createEvent.belongsPreviousDay");
            p.className = "rbc-event-warning";
          });
          periods = periods.concat(yestBlockedPeriods);
          periods.push({
            start: this.props.day.period.start,
            duration: yestEnd.diff(this.props.day.period.start) / 60000,
            className: "rbc-event-unavailable"
          });
        }
      }

      return (
        <div>
          <EventsBuilder
            start={this.props.day.period.start}
            duration={this.props.day.period.duration}
            precise={this.state.precise}
            periods={periods}
            onPeriodsUpdated={periods => {
              this.props.onDayUpdated({
                complete: this.props.day.complete,
                period: this.props.day.period,
                blockedPeriods: periods.filter(p => p.className !== "rbc-event-warning")
              });
            }}
            onSelectPeriod={period => {
              if(period.className !== "rbc-event-warning") {
                this.setState({ periodToRemove: period });
              }
            }}
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

  isDayCancelled() {
    const blockedPeriod = this.props.day.blockedPeriods.length === 1 ? this.props.day.blockedPeriods[0] : null;
    if(!blockedPeriod)
      return false;

    let realStart = moment(this.props.day.period.start);
    if(this.props.yesterday) {
      const yesterdayEnd = moment(this.props.yesterday.period.start).add(this.props.yesterday.period.duration, 'm');
      if(realStart.isBefore(yesterdayEnd)) {
        realStart = yesterdayEnd;
      }
    }
    const end = moment(this.props.day.period.start).add(this.props.day.period.duration || 1440, 'm');
    return realStart.isSameOrAfter(moment(blockedPeriod.start)) &&
      (end.diff(realStart) / 60000) <= blockedPeriod.duration;
  }

  endsNextDay() {
    const duration = this.props.day.period.duration || 1440;
    const start = moment(this.props.day.period.start);
    const end = moment(start).add(duration, 'm');
    if(end.isSame(moment(end).startOf('day'))) {
      end.subtract(1, 's');
    }
    start.startOf('day');
    end.startOf('day');
    return end.isAfter(start)
  }

  isDayOverlapped() {
    let overlapped = false;

    if(this.props.yesterday) {
      const yesterdayEnd = moment(this.props.yesterday.period.start)
        .add(this.props.yesterday.period.duration || 1440, 'm');
      const end = moment(this.props.day.period.start).add(this.props.day.period.duration || 1440, 'm');
      overlapped = yesterdayEnd.isSameOrAfter(end);
    }

    return overlapped;
  }

  overlappedDayStart() {
    let overlappedDayStart = "";

    if(this.props.yesterday) {
      const yesterdayEnd = moment(this.props.yesterday.period.start)
        .add(this.props.yesterday.period.duration || 1440, 'm');
      const start = moment(this.props.day.period.start);
      overlappedDayStart = yesterdayEnd.isAfter(start) ? yesterdayEnd.format("h:mm a") : "";
    }

    return overlappedDayStart;
  }

  renderWarnings() {
    if(this.isDayOverlapped()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#D32F2F", color: "#fff"}}
            classes={{avatar: "dayCancelledAvatar"}}
            avatar={<Avatar><WarningIcon /></Avatar>}
            label={I18n.t("createEvent.dayOverlapped")}
          />
        </div>
      );
    } else if(this.isDayCancelled()) {
      return (
        <div style={{textAlign: "center"}}>
          <Chip
            style={{marginBottom: "16px", background: "#D32F2F", color: "#fff"}}
            classes={{avatar: "dayCancelledAvatar"}}
            avatar={<Avatar><WarningIcon /></Avatar>}
            label={I18n.t("createEvent.dayCancelled")}
          />
        </div>
      );
    } else {
      const endsNextDay = this.endsNextDay();
      const overlappedDayStart = this.overlappedDayStart();
      if(endsNextDay || overlappedDayStart) {
        return (
          <div style={{textAlign: "center"}}>
            {overlappedDayStart &&
            <Chip
              style={{marginBottom: "16px", background: "#FFC107", color: "#000"}}
              classes={{avatar: "timeWarningAvatar"}}
              avatar={<Avatar><WarningIcon/></Avatar>}
              label={I18n.t("createEvent.startsAtEndOfPreviousDay") + " (" + overlappedDayStart + ")"}
            />}
            {endsNextDay &&
            <Chip
              style={{marginBottom: "16px", background: "#FFC107", color: "#000"}}
              classes={{avatar: "timeWarningAvatar"}}
              avatar={<Avatar><WarningIcon/></Avatar>}
              label={I18n.t("createEvent.endsNextDay")}
            />}
          </div>
        );
      }
    }
  }

  render() {
    if(!this.props.day.period || !this.props.day.blockedPeriods) {
      return <div />;
    }

    const { start, duration } = this.props.day.period;
    const end = !duration ? start : moment(start).add(duration, 'm').toDate();

    return (
      <Paper style={this.props.style}>
        <div style={{padding: "16px", paddingBottom: "0"}}>
          <Typography variant="headline" component="h3">
            <Translate value="createEvent.schedule" />
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={!this.props.day.complete}
                onChange={() => this.props.onDayUpdated({
                  complete: !this.props.day.complete,
                  period: {
                    start: moment(this.props.day.period.start).startOf('day').toDate(),
                    duration: 0
                  },
                  blockedPeriods: this.props.day.blockedPeriods
                })}
              />
            }
            label={<Translate value="createEvent.selectStartEndTime" />}
            style={{textAlign: "left", width: "100%", marginBottom: "-8px"}}
          />
          <div style={{display: "inline-block", textAlign: "left"}}>
            <TimeInput
              mode='12h'
              value={start}
              onChange={time => {
                const diff = moment(start).hours(time.getHours()).minutes(time.getMinutes()).diff(moment(start))/60000;
                const period = { start: time, duration: (((duration - diff) % 1440) + 1440) % 1440 };
                const blockedPeriods = this.getFixedBlockedPeriods(period, this.props.day.blockedPeriods);
                this.props.onDayUpdated({ period, blockedPeriods });
              }}
              style={{width: "100%", maxWidth: "80px", marginLeft: "5px"}}
              minutesStep={5}
              selectOnClose={true}
              classes={{input: "text-align-center"}}
              updateImmediately={true}
              disabled={this.props.day.complete}
            />
          </div>
          <div style={{display: "inline-block", textAlign: "center", verticalAlign: "middle"}}>
            <ArrowRightAltIcon color={this.props.day.complete ? "disabled" : undefined} />
          </div>
          <div style={{display: "inline-block", textAlign: "right"}}>
            <TimeInput
              mode='12h'
              value={end}
              onChange={time => {
                const diff = moment(end).hours(time.getHours()).minutes(time.getMinutes()).diff(moment(end)) / 60000;
                const period = { start, duration: (((duration + diff) % 1440) + 1440) % 1440 };
                const blockedPeriods = this.getFixedBlockedPeriods(period, this.props.day.blockedPeriods);
                this.props.onDayUpdated({ period, blockedPeriods });

                if(this.props.tomorrow && this.props.onTomorrowUpdated) {
                  const periodEnd = moment(period.start).add(period.duration || 1440, 'm');
                  const tomorrowEnd = moment(this.props.tomorrow.period.start)
                    .add(this.props.tomorrow.period.duration || 1440, 'm');
                  const tomorrowPeriod = {};
                  if(moment(this.props.tomorrow.period.start).isBefore(periodEnd)) {
                    tomorrowPeriod.start = periodEnd.toDate();
                    tomorrowPeriod.duration = tomorrowEnd.diff(periodEnd) / 60000;
                  } else {
                    tomorrowPeriod.start = this.props.tomorrow.period.start;
                    tomorrowPeriod.duration = this.props.tomorrow.period.duration;
                  }
                  this.props.onTomorrowUpdated({
                    period: this.props.tomorrow.period,
                    blockedPeriods: this.getFixedBlockedPeriods(tomorrowPeriod, this.props.tomorrow.blockedPeriods)
                  });
                }
              }}
              style={{width: "100%", maxWidth: "80px", marginLeft: "5px"}}
              minutesStep={5}
              selectOnClose={true}
              classes={{input: "text-align-center"}}
              updateImmediately={true}
              disabled={this.props.day.complete}
            />
          </div>

          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={this.state.showBlockedPeriods}
                onChange={() => this.setState({ showBlockedPeriods: !this.state.showBlockedPeriods })}
              />
            }
            label={<Translate value="createEvent.showSelectionOfHoursNotAvailable" />}
            style={{textAlign: "left", width: "100%", marginTop: "8px"}}
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
  day: PropTypes.object.isRequired,
  yesterday: PropTypes.object,
  tomorrow: PropTypes.object,
  onDayUpdated: PropTypes.func.isRequired,
  onTomorrowUpdated: PropTypes.func,
  preciseByDefault: PropTypes.bool,
  style: PropTypes.object
};

export default TimeRangePicker;
