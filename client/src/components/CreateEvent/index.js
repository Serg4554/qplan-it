import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as CreateEventOperations from '../../state/ducks/createEvent/operations';
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
import SelectDays from "./SelectDays"
import SelectHours from "./SelectHours"
import ExtraOptions from "./ExtraOptions"


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
    step: state.createEvent.step || 0,
    title: state.createEvent.title,
    days: state.createEvent.days || [],
    router: state.router,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  cancel: CreateEventOperations.cancel,
  nextStep: CreateEventOperations.nextStep,
  previousStep: CreateEventOperations.previousStep,
  setDays: CreateEventOperations.setDays,
  updateDays: CreateEventOperations.updateDays,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedDates: this.props.days.map(d => d.date),
      possibleSelectedDates: null,
      preciseTimeSelection: false,
      dialogs: {
        back: false,
        resetTime: false,
        invalidDays: false,
        allCancelled: false
      }
    };

    this.dialog = { opened: false };

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
        let dialogs = this.state.dialogs;
        dialogs.back = true;
        this.setState({ dialogs });
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
          let dialogs = this.state.dialogs;
          dialogs.invalidDays = true;
          this.setState({ dialogs });
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
            let dialogs = this.state.dialogs;
            dialogs.allCancelled = true;
            this.setState({ dialogs });
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
        let dialogs = this.state.dialogs;
        dialogs.resetTime = true;
        this.setState({ possibleSelectedDates: selectedDates, dialogs });
      }
    }
  }

  updateDialogContent() {
    let openedDialogKey = Object.keys(this.state.dialogs).find(key => this.state.dialogs[key]);
    this.dialog.opened = !!openedDialogKey;

    if(this.dialog.opened) {
      let dialogs = this.state.dialogs;
      switch(openedDialogKey) {
        case "back":
          this.dialog.title = I18n.t("event.areYouSure");
          this.dialog.message = I18n.t("event.hoursConfigLostAlert");
          this.dialog.onClose = () => {
            dialogs.back = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = () => {
            const period = defaultPeriod();
            let days = this.props.days.map(d => ({...d}));
            days.forEach(day => {
              day.period = period;
              day.blockedPeriods = [];
            });
            this.props.updateDays(days);
            this.props.previousStep();
            dialogs.back = false;
            this.setState({ dialogs });
          };
          break;

        case "resetTime":
          this.dialog.title = I18n.t("event.resetTimesAlert");
          this.dialog.message = I18n.t("event.resetTimesAlertMessage");
          this.dialog.onClose = () => {
            dialogs.resetTime = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = () => {
            const period = defaultPeriod();
            let days = this.getSelectedDays(this.state.possibleSelectedDates).map(d => ({...d}));
            days.forEach(day => {
              day.period = period;
              day.blockedPeriods = [];
            });
            this.props.updateDays(days);
            dialogs.resetTime = false;
            this.setState({selectedDates: this.state.possibleSelectedDates, possibleSelectedDates: null, dialogs});
          };
          break;

        case "invalidDays":
          this.dialog.title = I18n.t("event.cancelInvalidDaysAlert");
          this.dialog.message = I18n.t("event.cancelInvalidDaysMessage");
          this.dialog.onClose = () => {
            dialogs.invalidDays = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = () => {
            let days = this.props.days
              .filter(d => moment(d.period.end).isBefore(moment(d.period.start)))
              .map(d => ({...d}));
            days.forEach(day => {
              day.period.end = day.period.start;
            });
            this.props.updateDays(days);
            dialogs.invalidDays = false;
            this.setState({ dialogs });
            this.handleNextButton();
          };
          break;

        case "allCancelled":
          this.dialog.title = I18n.t("event.noDaysAvailable");
          this.dialog.message = I18n.t("event.noDaysAvailableMessage");
          this.dialog.onClose = () => {
            dialogs.allCancelled = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = undefined;
          break;

        default:
          break;
      }
    }
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
    this.updateDialogContent();

    return (
      <div>
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


        <Dialog
          open={this.dialog.opened}
          onClose={() => this.dialog.onClose()}
        >
          <DialogTitle>{this.dialog.title}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {this.dialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {
              this.dialog.onConfirm &&
              <Button onClick={() => this.dialog.onClose()} color="secondary">
                <Translate value="common.no"/>
              </Button>
            }
            <Button
              onClick={() => this.dialog.onConfirm ? this.dialog.onConfirm() : this.dialog.onClose()}
              color="primary"
              autoFocus
            >
              <Translate value={this.dialog.onConfirm ? "common.yes" : "common.ok"} />
            </Button>
          </DialogActions>
        </Dialog>
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
