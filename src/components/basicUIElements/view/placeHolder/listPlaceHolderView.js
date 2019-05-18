/* eslint-disable radix */
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Dimensions } from 'react-native';
import times from 'lodash/times';

import ListItemPlaceHolder from './listItemPlaceHolderView';

const HEIGHT = Dimensions.get('window').height;

const ListPlaceHolderView = () => {
  const ratio = (HEIGHT - 300) / 50;
  const listElements = [];

  times(parseInt(ratio), (i) => {
    listElements.push(<ListItemPlaceHolder key={i} />);
  });

  return (
    <Fragment>
      {listElements}
    </Fragment>
  );
};

const mapStateToProps = state => ({
  isDarkTheme: state.application.isDarkTheme,
});

export default connect(mapStateToProps)(ListPlaceHolderView);
