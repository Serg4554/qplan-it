import React from "react";
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as EventOperations from '../state/ducks/event/operations';

import { Translate } from "react-redux-i18n";
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
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class CreateEvent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      backDialogOpen: false,
      selectedDays: []
    }
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
    this.props.nextStep();
  }

  renderContent() {
    switch (this.props.step) {
      case 0:
        return (
          <SelectDays
            selectedDays={this.props.days}
            onSelectedDaysChanged={selectedDays => {
              this.props.setDays(selectedDays);
              this.setState({ selectedDays })
            }}
          />
        );
      case 1:
        return (
          <SelectHours
            highlightedDays={this.props.days}
            selectedDays={this.state.selectedDays}
            onSelectedDaysChanged={selectedDays => this.setState({ selectedDays })}
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
          open={this.state.backDialogOpen}
          onClose={() => this.setState({ backDialogOpen: false })}
        >
          <DialogTitle><Translate value="event.areYouSure" /></DialogTitle>
          <DialogContent>
            <DialogContentText>
              <Translate value="event.hoursConfigLostAlert" />
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ backDialogOpen: false })}
              color="secondary"
            >
              <Translate value="common.no" />
            </Button>
            <Button
              onClick={() => {
                this.setState({ backDialogOpen: false });
                //TODO: Remove hours configuration
                this.props.previousStep();
              }}
              color="primary"
              autoFocus
            >
              <Translate value="common.yes" />
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
  days: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  router: PropTypes.object,

  cancel: PropTypes.func,
  nextStep: PropTypes.func,
  previousStep: PropTypes.func,
  setDays: PropTypes.func,
  goToUrl: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateEvent);
