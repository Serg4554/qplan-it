import React from "react";
import PropTypes from 'prop-types'

import {Translate} from "react-redux-i18n";

const ExtraOptions = (props) => {
  return (
    <div>
      <h3><Translate value="event.extraOptionsDescription" /></h3>
    </div>
  );
};

ExtraOptions.propTypes = {

};

export default ExtraOptions;
