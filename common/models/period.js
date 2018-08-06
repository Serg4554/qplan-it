'use strict';

module.exports = function(model) {
  model.validate('startHour', validateStartHour, {message: 'Invalid hour (from 0 to 23)'});
  function validateStartHour(err) {
    if(this.startHour < 0 || this.startHour > 23) {
      err();
    }
  }

  model.validate('startMinute', validateStartMinute, {message: 'Invalid minute (from 0 to 59)'});
  function validateStartMinute(err) {
    if(this.startMinute < 0 || this.startMinute > 59) {
      err();
    }
  }

  model.validate('endHour', validateEndHour, {message: 'Invalid hour (from 0 to 23)'});
  function validateEndHour(err) {
    if(this.endHour < 0 || this.endHour > 23) {
      err();
    }
  }

  model.validate('endMinute', validateEndMinute, {message: 'Invalid minute (from 0 to 59)'});
  function validateEndMinute(err) {
    if(this.endMinute < 0 || this.endMinute > 59) {
      err();
    }
  }
};
