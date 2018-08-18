import React from "react";
import PropTypes from 'prop-types'
import theme from "../../config/theme";

import {Translate} from "react-redux-i18n";
import Calendar from "../Calendar";
import Button from "@material-ui/core/Button";

const SelectHours = (props) => {

  return (
    <div>
      <h3><Translate value="event.selectHoursDescription" /></h3>
      <div style={{textAlign: "center"}}>
        <Calendar
          selectedDays={props.selectedDays}
          allowedDays={props.highlightedDays}
          onSelectedDaysChanged={props.onSelectedDaysChanged.bind(this)}
          appendDays={false}
          selectRange={true}
          primaryColor={theme.palette.primary.main}
          secondaryColor={theme.palette.secondary.light}
          allowedDaysColor={theme.palette.secondary.clear}
        />
        <Button
          color="primary"
          variant="contained"
          onClick={() => props.onSelectedDaysChanged(props.highlightedDays)}
          disabled={props.selectedDays.length === props.highlightedDays.length}
          style={{display: "inline-block", marginTop: "4px"}}
        >
          <Translate value="common.selectAll" />
        </Button>
      </div>
    </div>
  );
};

SelectHours.propTypes = {
  highlightedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  selectedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onSelectedDaysChanged: PropTypes.func.isRequired
};

export default SelectHours;
