import React from "react";
import PropTypes from 'prop-types'
import moment from 'moment'

import DateRange from 'react-date-range/dist/components/DateRange';
import detectBrowserLanguage from 'detect-browser-language'
import * as locale from 'react-date-range/dist/locale';

const Calendar = (props) => {
  let minDate = props.minDate;
  let maxDate = props.maxDate;
  let disabledTimes = [];

  if(props.allowedDates) {
    minDate = new Date(Math.min.apply(null, props.allowedDates));
    maxDate = new Date(Math.max.apply(null, props.allowedDates));

    let min = moment(minDate).add(1, 'd');
    const max = moment(maxDate);
    const allowedTimes = props.allowedDates.map(d => d.getTime());
    while(min.isBefore(max)) {
      if(!allowedTimes.includes(min.toDate().getTime())) {
        disabledTimes.push(min.toDate().getTime());
      }
      min.add(1, 'd');
    }
  }
  
  function getLocale() {
    const rawLang = detectBrowserLanguage();
    const langComponents = rawLang.split('-');
    let lang = "";

    if(langComponents[1]) {
      switch(langComponents[0]) {
        case "en":
          if(langComponents[1] === "GB" || langComponents[1] === "US") {
            lang = rawLang.replace('-', '');
          } else {
            lang = "enGB";
          }
          break;
        case "fr":
          if(langComponents[1] === "CH") {
            lang = "frCH";
          } else {
            lang = "fr";
          }
          break;
        case "zh":
          if(langComponents[1] === "CN" || langComponents[1] === "TW") {
            lang = rawLang.replace('-', '');
          } else {
            lang = "zhCN";
          }
          break;
        default:
          lang = "";
      }
    }

    if(lang === "") {
      if(langComponents[0] === "en") {
        lang = "enGB";
      } else if(langComponents[0] === "zh") {
        lang = "zhCN";
      } else {
        lang = langComponents[0];
      }
    }

    let currentLocale = locale[lang];
    if(!currentLocale) {
      currentLocale = locale.enGB;
    }

    return currentLocale;
  }

  function splitRange(range) {
    let days = [];
    if(!disabledTimes.includes(range.startDate.getTime())) {
      days.push({
        startDate: range.startDate,
        endDate: range.startDate,
        color: props.primaryColor
      });
    }

    if(props.selectRange) {
      let startDate = moment(range.startDate).add(1, 'd');
      const endDate = moment(range.endDate);

      while (startDate.isSameOrBefore(endDate)) {
        if(!disabledTimes.includes(startDate.toDate().getTime())) {
          days.push({
            startDate: startDate.toDate(),
            endDate: startDate.toDate(),
            color: props.primaryColor
          });
        }
        startDate.add(1, 'd');
      }
    }
    return days;
  }

  function handleDateChange(range) {
    let newDays = splitRange(range);

    let selectedDates;
    if(!props.selectRange) {
      selectedDates = newDays.length > 0 ? [newDays[0].startDate] : [];
    } else if(!props.appendDates) {
      selectedDates = newDays.map(d => d.startDate);
    } else {
      let index;
      selectedDates = props.selectedDates.slice();
      newDays.forEach(newDay => {
        index = selectedDates.findIndex(day => day.getTime() === newDay.startDate.getTime());
        if (newDays.length === 1 && index !== -1) {
          selectedDates.splice(index, 1);
        } else if (index === -1) {
          selectedDates.push(newDay.startDate);
        }
      });
    }

    if(props.onSelectedDatesUpdated && (props.appendDates || selectedDates.length !== 0)) {
      props.onSelectedDatesUpdated(selectedDates);
    }
  }

  function getCalendarRanges() {
    const selectDate = props.selectedDates.length === 0 ?
      moment().startOf("day").toDate() :
      props.selectedDates[props.selectedDates.length - 1];

    const selection = [{
      key: "select",
      startDate: selectDate,
      endDate: selectDate,
      color: props.secondaryColor
    }];

    let selectedDates = props.selectedDates.map(selectedDay => ({
      startDate: selectedDay,
      endDate: selectedDay,
      color: props.primaryColor
    }));

    if(props.allowedDates) {
      selectedDates = props.allowedDates.map(allowedDay => ({
        key: "allowed",
        startDate: allowedDay,
        endDate: allowedDay,
        color: props.allowedDatesColor
      })).concat(selectedDates);
    }

    return selection.concat(selectedDates);
  }

  return (
    <div style={props.style}>
      <DateRange
        locale={getLocale()}
        shownDate={moment().startOf("day").toDate()}
        onChange={e => handleDateChange(e.select)}
        ranges={getCalendarRanges()}
        direction='horizontal'
        showDateDisplay={false}
        showPreview={false}
        focusedRange={[0, 0]}
        dragSelectionEnabled={!!props.selectRange}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
};

Calendar.propTypes = {
  selectRange: PropTypes.bool,
  appendDates: PropTypes.bool,
  selectedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
  allowedDates: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
  onSelectedDatesUpdated: PropTypes.func,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
  allowedDatesColor: PropTypes.string,
  minDate: PropTypes.instanceOf(Date),
  maxDate: PropTypes.instanceOf(Date),
  style: PropTypes.object,
};

export default Calendar;
