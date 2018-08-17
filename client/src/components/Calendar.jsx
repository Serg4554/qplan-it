import React from "react";
import PropTypes from 'prop-types'
import moment from 'moment'

import DateRange from 'react-date-range/dist/components/DateRange';

const Calendar = (props) => {
  function handleDateChange(range) {
    let newDays = [];
    newDays.push({
      startDate: range.startDate,
      endDate: range.startDate,
      color: props.primaryColor
    });

    if(props.selectRange) {
      let startDate = moment(range.startDate).add(1, 'd');
      const endDate = moment(range.endDate);
      while (startDate.isSameOrBefore(endDate)) {
        newDays.push({
          startDate: startDate.toDate(),
          endDate: startDate.toDate(),
          color: props.primaryColor
        });
        startDate.add(1, 'd');
      }
    }

    let selectedDays;
    if(props.selectRange) {
      let index;
      selectedDays = props.selectedDays.slice();
      newDays.forEach(dateRange => {
        index = selectedDays.findIndex(day => day.getTime() === dateRange.startDate.getTime());
        if (newDays.length === 1 && index !== -1) {
          selectedDays.splice(index, 1);
        } else if (index === -1) {
          selectedDays.push(dateRange.startDate);
        }
      });
    } else {
      selectedDays = [newDays[0].startDate];
    }

    if(props.onSelectedDaysChanged) {
      props.onSelectedDaysChanged(selectedDays);
    }
  }

  function getRanges() {
    const startDate = props.selectedDays.length === 0 ?
      moment().startOf("day").toDate() :
      props.selectedDays[props.selectedDays.length - 1];
    const selection = [{
      key: "select",
      startDate: startDate,
      endDate: startDate,
      color: props.secondaryColor
    }];
    return selection.concat(props.selectedDays.map(selectedDay => ({
      startDate: selectedDay,
      endDate: selectedDay,
      color: props.primaryColor
    })));
  }

  return (
    <div>
      <DateRange
        shownDate={moment().startOf("day").toDate()}
        onChange={e => handleDateChange(e.select)}
        ranges={getRanges()}
        direction='horizontal'
        showDateDisplay={false}
        showPreview={false}
        focusedRange={[0, 0]}
        dragSelectionEnabled={!!props.selectRange}
      />
    </div>
  );
};

Calendar.propTypes = {
  selectRange: PropTypes.bool,
  selectedDays: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  onSelectedDaysChanged: PropTypes.func,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
};

export default Calendar;
