import React from "react";
import PropTypes from 'prop-types'
import theme from "../../config/theme";
import moment from 'moment'
import { isMobile } from 'react-device-detect';

import { I18n, Translate } from "react-redux-i18n";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Calendar from "../Calendar";

const ExtraOptions = (props) => {
  function renderCalendar() {
    const defaultDate = moment().add(1, 'd').toDate();

    if(isMobile) {
      return (
        <TextField
          type="date"
          fullWidth
          value={props.expirationDate ?
            moment(props.expirationDate).format('YYYY-MM-DD') :
            moment(defaultDate).format('YYYY-MM-DD')}
          InputLabelProps={{ shrink: true }}
          onChange={event => props.updateExpirationDate(new Date(event.target.value))}
          disabled={!props.expirationDateEnabled}
        />
      );
    } else {
      return(
        <Calendar
          selectedDays={props.expirationDate ? [props.expirationDate] : [defaultDate]}
          onSelectedDaysUpdated={dates => props.updateExpirationDate(dates[0])}
          appendDays={false}
          selectRange={false}
          primaryColor={theme.palette.primary.main}
          secondaryColor={theme.palette.secondary.light}
          allowedDaysColor={theme.palette.secondary.clear}
          minDate={defaultDate}
          maxDate={props.expirationDateEnabled ? undefined : new Date()}
        />
      );
    }
  }

  return (
    <div>
      <h3><Translate value="event.extraOptionsDescription"/></h3>

      <Paper style={{maxWidth: "400px", margin: "0 auto", padding: "24px"}}>
        <TextField
          placeholder={I18n.t("event.passwordToParticipate")}
          type="password"
          margin="normal"
          fullWidth
          value={props.password}
          onChange={event => props.updatePassword(event.target.value)}
          style={{display: "block", margin: "-10px auto 0 auto", background: "#F5F5F5"}}
          inputProps={{style: {padding: "10px"}}}
        />
        <div style={{
          textAlign: "left",
          fontSize: "10pt",
          color: "rgba(0, 0, 0, 0.54)",
          marginTop: "7px"
        }}>
          <Translate value="event.usefulInformation" style={{fontWeight: "bold"}}/>
          &nbsp;
          <Translate value="event.emptyPasswordMessage"/>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={props.expirationDateEnabled}
              onChange={() => {
                props.updateExpirationDateEnabled(!props.expirationDateEnabled);
                if (!props.expirationDate) {
                  props.updateExpirationDate(moment().add(1, 'd').toDate());
                }
              }}
            />
          }
          label={I18n.t("event.setDeadlineToParticipate")}
          style={{marginTop: "24px"}}
        />

        { renderCalendar() }
      </Paper>
    </div>
  );
};

ExtraOptions.propTypes = {
  password: PropTypes.string,
  expirationDateEnabled: PropTypes.bool,
  expirationDate: PropTypes.instanceOf(Date),

  updatePassword: PropTypes.func,
  updateExpirationDate: PropTypes.func,
  updateExpirationDateEnabled: PropTypes.func
};

export default ExtraOptions;
