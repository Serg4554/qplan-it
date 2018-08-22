import React from "react";
import PropTypes from 'prop-types'
import theme from "../../config/theme";

import { Translate } from "react-redux-i18n";
import Calendar from "../Calendar";
import TimeRangePicker from "../TimeRangePicker";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const SelectHours = (props) => {
  if(!props.times || !props.times.period || !props.times.period.start || !props.times.period.end) {
    return <div />;
  }

  return (
    <div>
      <h3><Translate value="event.selectHoursDescription" /></h3>

      <div className="selectHoursContent">
        <div className="timeRangePicker">
          <TimeRangePicker
            times={props.times}
            onTimesUpdated={props.onTimesUpdated.bind(this)}
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
              <Translate value="event.selectedDays" />
            </Typography>
            <Calendar
              selectedDays={props.selectedDays}
              allowedDays={props.allowedDays}
              onSelectedDaysUpdated={props.onSelectedDaysUpdated.bind(this)}
              appendDays={false}
              selectRange={true}
              primaryColor={theme.palette.primary.main}
              secondaryColor={theme.palette.secondary.light}
              allowedDaysColor={theme.palette.secondary.clear}
            />
            <Button
              color="primary"
              variant="contained"
              onClick={() => props.onSelectedDaysUpdated(props.allowedDays)}
              disabled={props.selectedDays.length === props.allowedDays.length}
              style={{marginTop: "16px"}}
            >
              <Translate value="common.selectAll" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

SelectHours.propTypes = {
  allowedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  selectedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onSelectedDaysUpdated: PropTypes.func.isRequired,
  times: PropTypes.object,
  onTimesUpdated: PropTypes.func.isRequired,
  precise: PropTypes.bool.isRequired,
  onPreciseChange: PropTypes.func.isRequired
};

export default SelectHours;
