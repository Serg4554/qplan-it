import React from "react";
import PropTypes from 'prop-types'
import theme from "../../config/theme";

import {Translate} from "react-redux-i18n";
import Calendar from "../Calendar";
import Button from "@material-ui/core/Button";

const SelectDays = (props) => {
  return (
    <div>
      <h3><Translate value="event.selectDaysDescription" /></h3>
      <Calendar
        selectedDays={props.selectedDates}
        onSelectedDaysUpdated={props.onSelectedDatesUpdated.bind(this)}
        appendDays={true}
        selectRange={true}
        primaryColor={theme.palette.primary.main}
        secondaryColor={theme.palette.secondary.light}
      />
      <div style={{marginTop: "-10px"}}>
        <h3 style={{display: "inline-block"}}>
          {props.selectedDates.length}
          &nbsp;
          <Translate value={props.selectedDates.length === 1 ? "event.day" : "event.days"} />
        </h3>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => props.onSelectedDatesUpdated([])}
          disabled={props.selectedDates.length === 0}
          style={{display: "inline-block", marginLeft: "10px"}}
        >
          <Translate value="common.clear" />
        </Button>
      </div>
    </div>
  );
};

SelectDays.propTypes = {
  selectedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onSelectedDatesUpdated: PropTypes.func.isRequired
};

export default SelectDays;
