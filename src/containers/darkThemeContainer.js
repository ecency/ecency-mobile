import { React } from 'react';
import { connect } from 'react-redux';

const DarkThemeContainer = ({ children, isDarkTheme }) =>
  children &&
  children({
    isDarkTheme,
  });

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(DarkThemeContainer);
