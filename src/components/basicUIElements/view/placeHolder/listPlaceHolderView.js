/* eslint-disable radix */
import React, { Fragment } from 'react';
import { Dimensions } from 'react-native';
import times from 'lodash/times';

import ListItemPlaceHolder from './listItemPlaceHolderView';
import getWindowDimensions from '../../../../utils/getWindowDimensions';

const HEIGHT = getWindowDimensions().height;

const ListPlaceHolderView = () => {
  const ratio = (HEIGHT - 300) / 50;
  const listElements = [];

  times(parseInt(ratio), (i) => {
    listElements.push(<ListItemPlaceHolder key={i} />);
  });

  return <Fragment>{listElements}</Fragment>;
};
export default ListPlaceHolderView;
/* eslint-enable */
