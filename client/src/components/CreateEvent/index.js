import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as CreateEventOperations from '../../state/ducks/createEvent/operations';
import * as AuthOperations from "../../state/ducks/auth/operations";
import moment from "moment";
import credentials from "../../config/credentials";

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
import CircularProgress from "@material-ui/core/CircularProgress";
import Recaptcha from "react-recaptcha";


const mapStateToProps = state => {
  return {
    user: state.session.user,
    loading: state.createEvent.loading,
    id: state.createEvent.id,
    step: state.createEvent.step || 0,
    title: state.createEvent.title,
    days: state.createEvent.days || [],
    selectedDates: state.createEvent.selectedDates || [],
    password: state.createEvent.password || "",
    expirationDateEnabled: state.createEvent.expirationDateEnabled || false,
    expirationDate: state.createEvent.expirationDate,
    router: state.router,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  cancel: CreateEventOperations.cancel,
  nextStep: CreateEventOperations.nextStep,
  previousStep: CreateEventOperations.previousStep,
  setDays: CreateEventOperations.setDays,
  updateDays: CreateEventOperations.updateDays,
  setSelectedDates: CreateEventOperations.setSelectedDates,
  resetDaysConfig: CreateEventOperations.resetDaysConfig,
  resetExtraConfig: CreateEventOperations.resetExtraConfig,
  updatePassword: CreateEventOperations.updatePassword,
  updateExpirationDate: CreateEventOperations.updateExpirationDate,
  updateExpirationDateEnabled: CreateEventOperations.updateExpirationDateEnabled,
  create: CreateEventOperations.create,
  openLogin: AuthOperations.open,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

function getPeriodTimeRange(period) {
  return {
    start: moment().startOf('day').hours(period.start.getHours()).minutes(period.start.getMinutes()).toDate(),
    duration: period.duration
  };
}

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      possibleSelectedDates: null,
      preciseTimeSelection: false,
      selectExpirationDateOpen: false,
      captchaToken: null,
      dialogs: {
        back: false,
        resetTime: false,
        allCancelled: false,
        errorOccurred: false
      }
    };

    this.dialog = { opened: false };
  }

  componentDidMount() {
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
        let cancelledDays = this.props.days.filter(day => {
          const blockedPeriod = day.blockedPeriods.length === 1 ? day.blockedPeriods[0] : null;
          if(!blockedPeriod) return false;
          const start = moment(blockedPeriod.start)
            .hours(day.period.start.getHours())
            .minutes(day.period.start.getMinutes());
          return start.isSameOrAfter(moment(blockedPeriod.start)) &&
            (day.period.duration || 1440) <= blockedPeriod.duration;
        });

        if(cancelledDays.length === this.props.days.length) {
          let dialogs = this.state.dialogs;
          dialogs.allCancelled = true;
          this.setState({ dialogs });
        } else {
          this.props.nextStep();
        }
        break;
      case 2:
        this.recaptchaInstance.execute();
        break;
      default:
        this.props.nextStep();
    }
  }

  handleCreateEvent() {
    let sortedDays = this.props.days.map(d => ({...d})).sort((a, b) => a.period.start - b.period.start);
    let days = [];

    sortedDays.forEach((day, i) => {
      if(day.complete) {
        day.period.start = moment(day.period.start).startOf('day').toDate();
        day.period.duration = 1440;
      }
      delete day.complete;
      if(!day.period.duration) {
        day.period.duration = 1440;
      }

      const lastDayEnd = i > 0 ?
        moment(sortedDays[i - 1].period.start).add(sortedDays[i - 1].period.duration, 'm') :
        undefined;
      if(lastDayEnd && lastDayEnd.isAfter(moment(day.period.start))) {
        const dayEnd = moment(day.period.start).add(day.period.duration, 'm');
        day.period.start = lastDayEnd.toDate();
        day.period.duration = Math.ceil(dayEnd.diff(day.period.start) / 60000 / 5) * 5;
      }

      if(day.period.duration > 0) {
        if(day.blockedPeriods.length === 1 && (
          moment(day.period.start).isBefore(day.blockedPeriods[0].start) ||
          day.period.duration > day.blockedPeriods[0].duration)) {
          days.push(day);
        } else if(day.blockedPeriods.length !== 1) {
          days.push(day);
        }
      }
    });

    let password = this.props.user && this.props.user.id ? this.props.password : undefined;
    let expiration = this.props.user && this.props.user.id && this.props.expirationDateEnabled ?
      this.props.expirationDate :
      undefined;
    let owner = this.props.user ? this.props.user.id : undefined;
    return this.props.create(this.props.title, days, password, expiration, owner, this.state.captchaToken)
      .then(() => {
        if(this.props.id) {
          this.props.goToUrl("/" + this.props.id);
          this.props.cancel();
        } else {
          let dialogs = this.state.dialogs;
          dialogs.errorOccurred = true;
          this.setState({ dialogs });
          this.recaptchaInstance.reset();
        }
      });
  }

  getSelectedDays(dates) {
    const times = dates.map(d => moment(d).startOf('day').toDate().getTime());
    return this.props.days.filter(day => times.includes(moment(day.period.start).startOf('day').toDate().getTime()))
  }

  onSelectedDatesUpdated(selectedDates) {
    const selectedDays = this.getSelectedDays(selectedDates);
    if(selectedDays.length > 0) {
      const complete = selectedDays[0].complete;
      const strPeriod = JSON.stringify(getPeriodTimeRange(selectedDays[0].period));
      const strBlockedPeriods = JSON.stringify(selectedDays[0].blockedPeriods);

      if(selectedDays.every(day =>
        day.complete === complete &&
        JSON.stringify(getPeriodTimeRange(day.period)) === strPeriod &&
        JSON.stringify(day.blockedPeriods) === strBlockedPeriods)) {
        this.props.setSelectedDates(selectedDates);
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
          this.dialog.title = I18n.t("createEvent.areYouSure");
          this.dialog.message = I18n.t("createEvent.configLostAlert");
          this.dialog.onClose = () => {
            dialogs.back = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = () => {
            this.props.resetDaysConfig(this.props.days);
            this.props.resetExtraConfig();
            this.props.previousStep();
            dialogs.back = false;
            this.setState({ dialogs });
          };
          break;

        case "resetTime":
          this.dialog.title = I18n.t("createEvent.resetTimesAlert");
          this.dialog.message = I18n.t("createEvent.resetTimesAlertMessage");
          this.dialog.onClose = () => {
            dialogs.resetTime = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = () => {
            this.props.resetDaysConfig(this.getSelectedDays(this.state.possibleSelectedDates));
            dialogs.resetTime = false;
            this.props.setSelectedDates(this.state.possibleSelectedDates);
            this.setState({possibleSelectedDates: null, dialogs});
          };
          break;

        case "allCancelled":
          this.dialog.title = I18n.t("createEvent.noDaysAvailable");
          this.dialog.message = I18n.t("createEvent.noDaysAvailableMessage");
          this.dialog.onClose = () => {
            dialogs.allCancelled = false;
            this.setState({ dialogs });
          };
          this.dialog.onConfirm = undefined;
          break;

        case "errorOccurred":
          this.dialog.title = I18n.t("createEvent.errorOccurred");
          this.dialog.message = I18n.t("createEvent.errorOccurredMessage");
          this.dialog.onClose = () => {
            dialogs.errorOccurred = false;
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
            selectedDates={this.props.days.map(d => d.period.start)}
            onSelectedDatesUpdated={selectedDates => {
              this.props.setDays(selectedDates.map(date => ({ period: {start: date} })));
              this.props.setSelectedDates(selectedDates);
            }}
          />
        );
      case 1:
        console.log();
        const selectedDay = this.getSelectedDays([new Date(Math.min.apply(null, this.props.selectedDates))])[0];
        return (
          <SelectHours
            allowedDates={this.props.days.map(d => d.period.start)}
            selectedDates={this.props.selectedDates}
            onSelectedDatesUpdated={this.onSelectedDatesUpdated.bind(this)}
            day={selectedDay}
            yesterday={this.props.days.filter(d =>
              moment(d.period.start).startOf('day')
                .isSame(moment(selectedDay.period.start).startOf('day').subtract(1, 'd')))[0]}
            tomorrow={this.props.days.filter(d =>
              moment(d.period.start).startOf('day')
                .isSame(moment(selectedDay.period.start).startOf('day').add(1, 'd')))[0]}
            onDayUpdated={day => {
              const { complete, period, blockedPeriods } = day;
              this.props.updateDays(this.props.selectedDates.map(date => ({
                complete,
                period: {
                  start: moment(date).hours(period.start.getHours()).minutes(period.start.getMinutes()).toDate(),
                  duration: period.duration
                },
                blockedPeriods: blockedPeriods.map(bp => ({
                  start: moment(date).hours(bp.start.getHours()).minutes(bp.start.getMinutes()).toDate(),
                  duration: bp.duration
                }))
              })));
            }}
            onTomorrowUpdated={day => {
              this.props.updateDays([day]);
            }}
            precise={this.state.preciseTimeSelection}
            onPreciseChange={preciseTimeSelection => this.setState({ preciseTimeSelection })}
          />
        );
      case 2:
        return <ExtraOptions {...this.props} logged={!!this.props.user} />;
      default:
        break;
    }
  }

  render() {
    this.updateDialogContent();

    return (
      <div>
        <div style={{textAlign: "center"}}>
          <Stepper activeStep={this.props.step} style={{padding: "0"}}>
            <Step>
              <StepLabel key={0}><Translate value="createEvent.selectDays" /></StepLabel>
            </Step>
            <Step>
              <StepLabel key={1}><Translate value="createEvent.selectHours" /></StepLabel>
            </Step>
            <Step>
              <StepLabel optional={<Typography variant="caption"><Translate value="common.optional" /></Typography>}>
                <Translate value="createEvent.extraOptions" />
              </StepLabel>
            </Step>
          </Stepper>

          { this.renderContent() }

          <div style={{textAlign: "right", marginTop: "20px", width: "100%"}}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.handleBackButton()}
              disabled={this.props.loading}
            >
              <Translate value="common.back" />
            </Button>
            <div style={{position: 'relative', display: 'inline'}}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleNextButton()} style={{marginLeft: "10px"}}
                disabled={this.props.days.length === 0 || this.props.loading}
              >
                <Translate value={this.props.step < 2 ? "common.next" : "common.finish"} />
              </Button>
              {this.props.loading && <CircularProgress className="buttonLoading" size={24} />}
            </div>
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

        <Recaptcha
          ref={obj => this.recaptchaInstance = obj}
          sitekey={credentials.invisibleCaptchaKey}
          size="invisible"
          verifyCallback={captchaToken => {
            this.setState({ captchaToken }, () => this.handleCreateEvent());
          }}
          badge="bottomleft"
        />
      </div>
    );
  }
}

CreateEvent.propTypes = {
  user: PropTypes.object,
  loading: PropTypes.bool,
  id: PropTypes.string,
  step: PropTypes.number,
  title: PropTypes.string,
  days: PropTypes.arrayOf(PropTypes.object),
  selectedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  password: PropTypes.string,
  expirationDateEnabled: PropTypes.bool,
  expirationDate: PropTypes.instanceOf(Date),
  router: PropTypes.object,

  cancel: PropTypes.func,
  nextStep: PropTypes.func,
  previousStep: PropTypes.func,
  setDays: PropTypes.func,
  updateDays: PropTypes.func,
  setSelectedDates: PropTypes.func,
  resetDaysConfig: PropTypes.func,
  resetExtraConfig: PropTypes.func,
  updatePassword: PropTypes.func,
  updateExpirationDate: PropTypes.func,
  updateExpirationDateEnabled: PropTypes.func,
  create: PropTypes.func,
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
