import React from "react";
import PropTypes from 'prop-types'
import theme from "../../config/theme";

import { Translate } from "react-redux-i18n";
import Calendar from "../Calendar";
import TimeRangePicker from "../TimeRangePicker";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const SelectHours = (props) => {
  if(props.day && props.day.period && props.day.period.start) {
    return (
      <div>
        <h3><Translate value="createEvent.selectHoursDescription"/></h3>

        <div className="selectHoursContent">
          <div className="timeRangePicker">
            <TimeRangePicker
              day={props.day}
              onDayUpdated={props.onDayUpdated.bind(this)}
              style={{
                display: "inline-block",
                position: "relative",
                textAlign: "center",
                width: "100%"
              }}
            />
          </div>

          <div className="calendar">
            <div style={{display: "inline-block", textAlign: "center"}}>
              <Typography variant="headline" component="h3">
                <Translate value="createEvent.selectedDays"/>
              </Typography>
              <Calendar
                selectedDates={props.selectedDates}
                allowedDates={props.allowedDates}
                onSelectedDatesUpdated={props.onSelectedDatesUpdated.bind(this)}
                appendDates={false}
                selectRange={true}
                primaryColor={theme.palette.primary.main}
                secondaryColor={theme.palette.secondary.light}
                allowedDatesColor={theme.palette.secondary.clear}
              />
              <Button
                color="primary"
                variant="contained"
                onClick={() => props.onSelectedDatesUpdated(props.allowedDates)}
                disabled={props.selectedDates.length === props.allowedDates.length}
                style={{marginTop: "16px"}}
              >
                <Translate value="common.selectAll"/>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return <div />;
  }
};

SelectHours.propTypes = {
  allowedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  selectedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onSelectedDatesUpdated: PropTypes.func.isRequired,
  day: PropTypes.object,
  onDayUpdated: PropTypes.func.isRequired,
  precise: PropTypes.bool.isRequired,
  onPreciseChange: PropTypes.func.isRequired
};

export default SelectHours;
