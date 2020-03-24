/* eslint-disable no-unused-vars */
import React from 'react';
import { connect } from 'react-redux';

const ThemeContainer = ({ children, isDarkTheme }) => {
  return (
    children &&
    children({
      isDarkTheme,
    })
  );
};

const mapStateToProps = (state) => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(ThemeContainer);
/* eslint-enable */
