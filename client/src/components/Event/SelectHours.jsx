import React from "react";
import PropTypes from 'prop-types'
import theme from "../../config/theme";
import moment from "moment";

import { Translate } from "react-redux-i18n";
import Calendar from "../Calendar";
import TimeRangePicker from "../TimeRangePicker";
import Button from "@material-ui/core/Button";

const SelectHours = (props) => {
  const startTime = moment()
    .startOf('day')
    .hour(props.timeData.startHour)
    .minutes(props.timeData.startMinutes)
    .toDate();

  const endTime = moment()
    .startOf('day')
    .hour(props.timeData.endHour)
    .minutes(props.timeData.endMinutes)
    .toDate();

  return (
    <div>
      <h3><Translate value="event.selectHoursDescription" /></h3>

      <div className="selectHoursContent">
        <div className="timeRangePicker">
          <TimeRangePicker
            startTime={startTime}
            endTime={endTime}
            onTimesUpdated={(startTime, endTime) => {
              props.onTimeDataUpdated({
                startHour: startTime.getHours(),
                startMinutes: startTime.getMinutes(),
                endHour: endTime.getHours(),
                endMinutes: endTime.getMinutes(),
              });
            }}
          />
        </div>

        <div className="calendar">
          <Calendar
            selectedDays={props.selectedDays}
            allowedDays={props.allowedDays}
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
            onClick={() => props.onSelectedDaysChanged(props.allowedDays)}
            disabled={props.selectedDays.length === props.allowedDays.length}
            style={{display: "inline-block", marginTop: "4px"}}
          >
            <Translate value="common.selectAll" />
          </Button>
        </div>
      </div>
    </div>
  );
};

SelectHours.propTypes = {
  allowedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  selectedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onSelectedDaysChanged: PropTypes.func.isRequired,
  timeData: PropTypes.object,
  onTimeDataUpdated: PropTypes.func.isRequired,
  precise: PropTypes.bool.isRequired,
  onPreciseChange: PropTypes.func.isRequired
};

export default SelectHours;
