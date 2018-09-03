import React from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { push } from "connected-react-router";
import * as EventOperations from '../state/ducks/event/operations';
import * as AuthOperations from "../state/ducks/auth/operations";
import copy from 'copy-to-clipboard';

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
import FileCopy from '@material-ui/icons/FileCopy';
import Tooltip from "@material-ui/core/Tooltip/Tooltip";


const mapStateToProps = state => {
  return {
    user: state.session.user,
    claimTokens: state.session.claimTokens,
    loading: state.event.loading,
    claiming: state.event.claiming,
    error: state.event.error,
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
  goToUrl: url => {
    return push(url)
  }
}, dispatch);

class Event extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      claimEventStep: 0,
      dialogs: {
        notFound: false,
      }
    };
    props.getEvent(this.props.match.params.eventId)
      .then(() => {
        if(this.props.error) {
          let dialogs = this.state.dialogs;
          dialogs.notFound = true;
          this.setState({ dialogs });
        }
      });

    this.dialog = { opened: false };
  };

  componentWillUnmount() {
    this.props.close();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.shareInput.select();
    if(this.state.claimEventStep === 1 && this.props.user) {
      this.setState({ claimEventStep: 2 });
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
            dialogs.back = false;
            this.setState({ dialogs });
            this.props.goToUrl("/");
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

  getShareUrl() {
    return window.location.host + "/" + this.props.id;
  }

  render() {
    this.updateDialogContent();

    return (
      <div>
        <div>
          <h1 style={{textAlign: "center", marginBottom: "5px"}}>{this.props.title}</h1>
          {this.renderClaimEvent()}
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
                <FileCopy/>
              </IconButton>
            </Tooltip>
          </div>
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
  claimTokens: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  claiming: PropTypes.bool,
  error: PropTypes.object,
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
  goToUrl: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(Event);
