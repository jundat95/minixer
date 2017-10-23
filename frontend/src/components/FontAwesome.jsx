import React from 'react';
import PropTypes from 'prop-types';

const FontAwesome = props => (
  <i className={`fa fa-${props.iconName}`} />
);

FontAwesome.propTypes = {
  iconName: PropTypes.string.isRequired,
};

export default FontAwesome;
