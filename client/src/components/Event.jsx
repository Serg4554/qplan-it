import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as EventOperations from '../state/ducks/event/operations';
import * as AuthOperations from "../state/ducks/auth/operations";
import * as SessionOperations from "../state/ducks/session/operations";
import copy from 'copy-to-clipboard';
import moment from "moment";

import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import {I18n, Translate} from "react-redux-i18n";
import Dialog from "@material-ui/core/Dialog";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import StepContent from "@material-ui/core/StepContent";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import TextField from "@material-ui/core/TextField/TextField";
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";
import EventCalendar from "./EventCalendar";
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import CancelIcon from '@material-ui/icons/Cancel';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';


const mapStateToProps = state => {
  return {
    user: state.session.user,
    anonymousUser: state.session.anonymousUser,
    claimTokens: state.session.claimTokens,
    loading: state.event.loading,
    claiming: state.event.claiming,
    error: state.event.error,
    selectionError: state.event.selectionError,
    id: state.event.id,
    title: state.event.title,
    creation: state.event.creation,
    expiration: state.event.expiration,
    ownerId: state.event.ownerId,
    days: state.event.days,
  }
};

const mapDispatchToProps = dispatch => bindActionCreators({
  close: EventOperations.close,
  getEvent: EventOperations.getEvent,
  claim: EventOperations.claim,
  openLogin: AuthOperations.open,
  setAnonymousUser: SessionOperations.setAnonymousUser,
  addSelections: EventOperations.addSelections,
  clearSelectionError: EventOperations.clearSelectionError,
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class Event extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      claimEventStep: 0,
      startIndex: 0,
      days: [],
      anonymousSelection: null,
      anonymousUser: {},
      dialogs: {
        notFound: false,
        selectionError: false,
      }
    };
    props.getEvent(this.props.match.params.eventId)
      .then(() => {
        if(this.props.error) {
          let dialogs = this.state.dialogs;
          dialogs.notFound = true;
          this.setState({ dialogs });
        } else {
          this.setState({ days: this.getDays() });
        }
      });

    this.dialog = { opened: false };
  };

  componentWillUnmount() {
    this.props.close();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.state.claimEventStep === 1 && this.props.user) {
      this.setState({ claimEventStep: 2 });
    }
    if(this.state.anonymousSelection && !prevProps.user && !!this.props.user) {
      this.onPeriodsUpdated(this.state.anonymousSelection);
    }
  }

  updateDialogContent() {
    let openedDialogKey = Object.keys(this.state.dialogs).find(key => this.state.dialogs[key]);
    this.dialog.opened = !!openedDialogKey;

    if(this.dialog.opened) {
      let dialogs = this.state.dialogs;
      switch(openedDialogKey) {
        case "notFound":
          this.dialog.title = I18n.t("event.notFound");
          this.dialog.message = I18n.t("event.notFoundMessage");
          this.dialog.onClose = () => {
            this.props.goToUrl("/");
          };
          this.dialog.onConfirm = undefined;
          break;

        case "selectionError":
          this.dialog.title = I18n.t("event.selectionError");
          this.dialog.message = I18n.t("event.selectionErrorMessage");
          this.dialog.onClose = () => {
            dialogs.selectionError = false;
            this.setState({ dialogs });
            this.props.clearSelectionError();
          };
          this.dialog.onConfirm = undefined;
          break;

        default:
          break;
      }
    }
  }

  claimToken() {
    if(!this.props.claimTokens || !this.props.id) {
      return undefined;
    }

    let token = this.props.claimTokens.find(token => token.event === this.props.id);
    return token ? token.secret : undefined;
  }

  renderClaimEvent() {
    if(!this.props.ownerId && this.claimToken()) {
      return (
        <Button
          style={{display: "block", margin: "0 auto"}}
          variant="outlined"
          color="primary"
          onClick={() => this.setState({ claimEventStep: this.props.user ? 2 : 1 })}
        >
          <Translate value="event.claimYourEvent" />
        </Button>
      );
    } else if(this.props.user && this.props.ownerId === this.props.user.id) {
      return (
        <div style={{width: "100%", textAlign: "center", fontSize: "10pt", color: "#888", fontWeight: "lighter"}}>
          <Translate value="event.youAreTheOwner" />
        </div>
      );
    }
  }

  renderAnonymousUser() {
    if(!this.props.loading && !this.props.user && this.props.anonymousUser && this.props.anonymousUser.name)
    return (
      <div style={{width: "100%", textAlign: "center", fontSize: "10pt", color: "#888", fontWeight: "lighter"}}>
        <Translate value="event.participatingAnonymouslyAs" />:&nbsp;
        <span style={{fontWeight: "bold"}}>
          {this.props.anonymousUser.name}
          {this.props.anonymousUser.surname ? " " + this.props.anonymousUser.surname : ""}
        </span>
        &nbsp;
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            this.setState({
              anonymousUser: this.props.anonymousUser,
              anonymousSelection: "changeAnonymousUser"
            })
          }}
          style={{outline: "none"}}
        >
          <Translate value="event.change" />
        </a>
      </div>
    );
  }

  getShareUrl() {
    return window.location.host + "/" + this.props.id;
  }

  getDays() {
    let days = this.props.days;
    days = days ? this.props.days.sort((a, b) => a.period.start - b.period.start): [];
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
    return days;
  }

  onPeriodsUpdated(periods) {
    if(!this.props.user && !this.props.anonymousUser) {
      return this.setState({ anonymousSelection: periods })
    }

    if(this.state.anonymousSelection) {
      let anonymousSelection = this.state.anonymousSelection;
      this.setState({anonymousSelection: null});
      if (anonymousSelection === "changeAnonymousUser")
        return;
    }

    this.props.addSelections(this.props.id, periods.map(period => ({period})))
      .then(() => {
        if(this.props.selectionError) {
          let dialogs = this.state.dialogs;
          dialogs.selectionError = true;
          this.setState({ dialogs });
        }
      });
  }

  onSelectPeriod(period) {
    console.log(period);
  }

  renderEventCalendar() {
    if(this.props.loading) {
      return (
        <div  style={{width: "100%", textAlign: "center", marginTop: "30px"}}>
          <CircularProgress size={60} />
        </div>
      );
    } else if(this.props.error) {
      return (
        <div  style={{width: "100%", textAlign: "center", marginTop: "30px"}}>
          <CancelIcon style={{fontSize: "100pt", color: "#555"}}/>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{margin: "8px auto", width: "100%"}}>
            <div style={{display: "inline-block", width: "50%", textAlign: "left"}}>
              <Button
                variant="fab"
                mini
                aria-label="previous"
                color="primary"
                disabled={this.state.startIndex === 0}
                onClick={() => this.setState({ startIndex: this.state.startIndex - 1 })}
              >
                <NavigateBeforeIcon />
              </Button>
            </div>
            <div style={{display: "inline-block", width: "50%", textAlign: "right"}}>
              <Button
                variant="fab"
                mini
                aria-label="next"
                color="primary"
                disabled={this.state.startIndex + 7 >= this.state.days.length}
                onClick={() => this.setState({ startIndex: this.state.startIndex + 1 })}
              >
                <NavigateNextIcon />
              </Button>
            </div>
          </div>

          <EventCalendar
            days={this.state.days.slice(this.state.startIndex, this.state.startIndex + 7)}
            onPeriodsUpdated={this.onPeriodsUpdated.bind(this)}
            onSelectPeriod={this.onSelectPeriod.bind(this)}
          />
        </div>
      );
    }
  }

  render() {
    this.updateDialogContent();

    return (
      <div>
        <div>
          <h1 style={{textAlign: "center", marginBottom: "5px"}}>{this.props.title}</h1>
          {this.renderClaimEvent()}
          {this.renderAnonymousUser()}
          <div style={{textAlign: "center", marginTop: "14px"}}>
            <TextField
              inputRef={obj => this.shareInput = obj}
              style={{display: "inline-block", maxWidth: "130px", margin: "0"}}
              margin="normal"
              fullWidth={true}
              value={this.getShareUrl()}
              onClick={() => this.shareInput.select()}
              inputProps={{style: {textAlign: "center", paddingTop: "0px"}}}
            />
            <Tooltip
              title={I18n.t("common.copy")}
              placement="right"
              PopperProps={{style: {marginLeft: "-10px"}}}
              disableFocusListener
            >
              <IconButton color="secondary" style={{display: "inline-block"}} onClick={() => {
                this.shareInput.select();
                copy(this.getShareUrl());
              }}>
                <FileCopyIcon/>
              </IconButton>
            </Tooltip>
          </div>

          { this.renderEventCalendar() }
        </div>


        <Dialog
          open={this.state.claimEventStep !== 0}
          onClose={() => this.setState({ claimEventStep: 0 })}
        >
          <DialogTitle><Translate value="event.claimYourEvent" /></DialogTitle>
          <DialogContent>
            <Typography><Translate value="event.claimToModifyEvent" /></Typography>
            <Typography style={{fontWeight: "bold"}}><Translate value="event.claimToNotLoseIt" /></Typography>

            <Stepper activeStep={this.state.claimEventStep - 1} orientation="vertical">
              <Step key="login">
                <StepLabel><Translate value="auth.login" /></StepLabel>
                <StepContent>
                  <Typography><Translate value="event.whomToAssignEvent" /></Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{marginTop: "10px"}}
                    onClick={() => this.props.openLogin()}
                  >
                    <Translate value="auth.login" />
                  </Button>
                </StepContent>
              </Step>

              <Step key="claim">
                <StepLabel><Translate value="event.claim" /></StepLabel>
                <StepContent>
                  <Typography>
                    <Translate value="event.youCanClaimEvent" name={this.props.user ? this.props.user.name : ""} />
                  </Typography>
                  <div style={{position: 'relative', display: "inline-block", marginTop: "10px"}}>
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={this.props.claiming}
                      onClick={() => {
                        this.props.claim(this.props.id, this.claimToken())
                          .then(() => {
                            if(this.props.ownerId) {
                              this.setState({ claimEventStep: 0 });
                            }
                          })
                      }}
                    >
                      <Translate value="event.claim" />
                    </Button>
                    {this.props.claiming && <CircularProgress className="buttonLoading" size={24} />}
                  </div>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => this.setState({ claimEventStep: 0 })}
              color="primary"
            >
              <Translate value="common.close" />
            </Button>
          </DialogActions>
        </Dialog>


        <Dialog
          open={this.state.anonymousSelection !== null}
        >
          <DialogTitle><Translate value="event.anonymousWhoYouAre"/></DialogTitle>
          <DialogContent>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.props.openLogin()}
              style={{display: "block", width: "100%"}}
            >
              <Translate value="auth.login"/>
            </Button>
            <div style={{width: "100%", height: "1px", margin: "20px 0", background: "#ccc"}}/>
            <Typography><Translate value="event.participateRightNow"/></Typography>
            <TextField
              inputRef={obj => this.nameInput = obj}
              placeholder={I18n.t("auth.name") + " *"}
              margin="normal"
              fullWidth={true}
              value={this.state.anonymousUser.name || ""}
              onChange={event =>
                this.setState({anonymousUser: {name: event.target.value, surname: this.state.anonymousUser.surname}})
              }
              style={{display: "inline-block", width: "calc(50% - 8px)"}}
            />
            <TextField
              placeholder={I18n.t("auth.surname")}
              margin="normal"
              fullWidth={true}
              value={this.state.anonymousUser.surname || ""}
              onChange={event =>
                this.setState({anonymousUser: {name: this.state.anonymousUser.name, surname: event.target.value}})
              }
              style={{display: "inline-block", width: "calc(50% - 8px)", marginLeft: "16px"}}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ anonymousSelection: null, anonymousUser: {} })} color="secondary">
              <Translate value="common.cancel"/>
            </Button>
            <Button
              onClick={() => {
                if(!this.state.anonymousUser.name) {
                  this.nameInput.select();
                } else {
                  this.props.setAnonymousUser(this.state.anonymousUser);
                  this.setState({ anonymousUser: {} }, () => this.onPeriodsUpdated(this.state.anonymousSelection));
                }
              }}
              color="primary"
              autoFocus
            >
              <Translate value="common.save" />
            </Button>
          </DialogActions>
        </Dialog>


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

Event.propTypes = {
  user: PropTypes.object,
  anonymousUser: PropTypes.object,
  claimTokens: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  claiming: PropTypes.bool,
  error: PropTypes.object,
  selectionError: PropTypes.object,
  id: PropTypes.string,
  title: PropTypes.string,
  creation: PropTypes.instanceOf(Date),
  expiration: PropTypes.instanceOf(Date),
  ownerId: PropTypes.string,
  days: PropTypes.arrayOf(PropTypes.object),

  close: PropTypes.func,
  getEvent: PropTypes.func,
  claim: PropTypes.func,
  openLogin: PropTypes.func,
  setAnonymousUser: PropTypes.func,
  addSelections: PropTypes.func,
  goToUrl: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Event);
