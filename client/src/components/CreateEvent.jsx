import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as EventOperations from '../state/ducks/event/operations';
import moment from "moment";

import { I18n, Translate } from "react-redux-i18n";
import Button from "@material-ui/core/Button";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContentText from "@material-ui/core/DialogContentText";
import Dialog from "@material-ui/core/Dialog";
import SelectDays from "./Event/SelectDays"
import SelectHours from "./Event/SelectHours"
import ExtraOptions from "./Event/ExtraOptions"


const defaultPeriod = () => {
  const DEFAULT_START_HOUR = 8;
  const DEFAULT_END_HOUR = 22;

  return {
    start: moment().startOf('day').hours(DEFAULT_START_HOUR).toDate(),
    end: moment().startOf('day').hours(DEFAULT_END_HOUR).toDate()
  };
};

const mapStateToProps = state => {
  /** @namespace state.passwordRecovery */
  return {
    step: state.event.step || 0,
    title: state.event.title,
    days: state.event.days || [],
    router: state.router,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  cancel: EventOperations.cancel,
  nextStep: EventOperations.nextStep,
  previousStep: EventOperations.previousStep,
  setDays: EventOperations.setDays,
  updateDays: EventOperations.updateDays,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      backDialogOpen: false,
      selectedDates: this.props.days.map(d => d.date),
      possibleSelectedDates: null,
      preciseTimeSelection: false,
      invalidDaysDialogOpen: false,
      allCancelledDialogOpen: false
    };

    window.onbeforeunload = () => "Changes will be lost";
  }

  componentWillUnmount() {
    window.onbeforeunload = null;
  }

  handleBackButton() {
    switch (this.props.step) {
      case 0:
        this.props.goToUrl("/");
        break;
      case 1:
        this.setState({ backDialogOpen: true });
        break;
      default:
        this.props.previousStep();
    }
  }

  handleNextButton() {
    switch (this.props.step) {
      case 0:
        this.props.nextStep();
        break;
      case 1:
        if(this.props.days.filter(d => moment(d.period.end).isBefore(moment(d.period.start))).length > 0) {
          this.setState({ invalidDaysDialogOpen: true });
        } else {
          let cancelledDays = this.props.days.filter(day => {
            const blockedPeriod = day.blockedPeriods.length === 1 ? day.blockedPeriods[0] : null;
            const allBlocked = blockedPeriod &&
              blockedPeriod.start.getTime() === day.period.start.getTime() &&
              blockedPeriod.end.getTime() === day.period.end.getTime();
            const cancelled = moment(day.period.start).isSameOrAfter(moment(day.period.end));
            return allBlocked || cancelled;
          });

          if(cancelledDays.length === this.props.days.length) {
            this.setState({ allCancelledDialogOpen: true });
          } else {
            this.props.nextStep();
          }
        }
        break;
      default:
        this.props.nextStep();
    }
  }

  getSelectedDays(dates) {
    const times = dates.map(d => d.getTime());
    return this.props.days.filter(day => times.includes(day.date.getTime()))
  }

  onSelectedDaysUpdated(selectedDates) {
    const selectedDays = this.getSelectedDays(selectedDates);
    if(selectedDays.length > 0) {
      const strPeriod = JSON.stringify(selectedDays[0].period);
      const strBlockedPeriods = JSON.stringify(selectedDays[0].blockedPeriods);

      if(selectedDays.every(day =>
        JSON.stringify(day.period) === strPeriod &&
        JSON.stringify(day.blockedPeriods) === strBlockedPeriods)) {
        this.setState({ selectedDates });
      } else {
        this.setState({ possibleSelectedDates: selectedDates });
      }
    }
  }

  dialog(title, message, openProperty, onConfirm, question, noBoolean) {
    let closeObj = [];
    closeObj[openProperty] = noBoolean ? null : false;

    return (
      <Dialog
        open={noBoolean ? this.state[openProperty] !== null : this.state[openProperty]}
        onClose={() => this.setState(closeObj)}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {question &&
            <Button onClick={() => this.setState(closeObj)} color="secondary">
              <Translate value="common.no"/>
            </Button>
          }
          <Button
            onClick={() => onConfirm()}
            color="primary"
            autoFocus
          >
            <Translate value={question ? "common.yes" : "common.ok"} />
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  renderContent() {
    switch (this.props.step) {
      case 0:
        return (
          <SelectDays
            selectedDates={this.props.days.map(d => d.date)}
            onSelectedDatesUpdated={selectedDates => {
              this.props.setDays(selectedDates.map(date => ({
                date,
                period: defaultPeriod(),
                blockedPeriods: []
              })));
              this.setState({ selectedDates });
            }}
          />
        );
      case 1:
        return (
          <SelectHours
            allowedDays={this.props.days.map(d => d.date)}
            selectedDays={this.state.selectedDates}
            onSelectedDaysUpdated={this.onSelectedDaysUpdated.bind(this)}
            times={this.getSelectedDays(this.state.selectedDates)[0]}
            onTimesUpdated={times => {
              const { period, blockedPeriods } = times;
              this.props.updateDays(this.state.selectedDates.map(date => ({ date, period, blockedPeriods })));
            }}
            precise={this.state.preciseTimeSelection}
            onPreciseChange={preciseTimeSelection => this.setState({ preciseTimeSelection })}
          />
        );
      case 2:
        return (
          <ExtraOptions

          />
        );
      default:
        break;
    }
  }

  render() {
    return (
      <div>
        {this.dialog(I18n.t("event.areYouSure"), I18n.t("event.hoursConfigLostAlert"), "backDialogOpen",
          () => {
            const period = defaultPeriod();
            let days = this.props.days.map(d => ({...d}));
            days.forEach(day => {
              day.period = period;
              day.blockedPeriods = [];
            });
            this.props.updateDays(days);
            this.props.previousStep();
            this.setState({backDialogOpen: false});
          }, true)}

        {this.dialog(I18n.t("event.resetHoursAlert"), I18n.t("event.resetHoursAlertMessage"),
          "possibleSelectedDates", () => {
            const period = defaultPeriod();
            let days = this.getSelectedDays(this.state.possibleSelectedDates).map(d => ({...d}));
            days.forEach(day => {
              day.period = period;
              day.blockedPeriods = [];
            });
            this.props.updateDays(days);
            this.setState({selectedDates: this.state.possibleSelectedDates, possibleSelectedDates: null});
          }, true, true)}

        {this.dialog(I18n.t("event.cancelInvalidDaysAlert"), I18n.t("event.cancelInvalidDaysMessage"),
          "invalidDaysDialogOpen", () => {
            let days = this.props.days
              .filter(d => moment(d.period.end).isBefore(moment(d.period.start)))
              .map(d => ({...d}));
            days.forEach(day => {
              day.period.end = day.period.start;
            });
            this.props.updateDays(days);
            this.setState({invalidDaysDialogOpen: false});
            this.handleNextButton();
          }, true)}

        {this.dialog(I18n.t("event.noDaysAvailable"), I18n.t("event.noDaysAvailableMessage"),
          "allCancelledDialogOpen", () => {
            this.setState({allCancelledDialogOpen: false});
          })}


        <div style={{textAlign: "center"}}>
          <Stepper activeStep={this.props.step}>
            <Step>
              <StepLabel key={0}><Translate value="event.selectDays" /></StepLabel>
            </Step>
            <Step>
              <StepLabel key={1}><Translate value="event.selectHours" /></StepLabel>
            </Step>
            <Step>
              <StepLabel optional={<Typography variant="caption"><Translate value="common.optional" /></Typography>}>
                <Translate value="event.extraOptions" />
              </StepLabel>
            </Step>
          </Stepper>

          { this.renderContent() }

          <div style={{textAlign: "right", marginTop: "20px", width: "100%"}}>
            <Button variant="contained" color="secondary" onClick={() => this.handleBackButton()}>
              <Translate value="common.back" />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.handleNextButton()} style={{marginLeft: "10px"}}
              disabled={this.props.days.length === 0}
            >
              <Translate value={this.props.step < 2 ? "common.next" : "common.finish"} />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

CreateEvent.propTypes = {
  step: PropTypes.number,
  title: PropTypes.string,
  days: PropTypes.arrayOf(PropTypes.object),
  router: PropTypes.object,

  cancel: PropTypes.func,
  nextStep: PropTypes.func,
  previousStep: PropTypes.func,
  setDays: PropTypes.func,
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
