/* eslint-disable radix */
import times from 'lodash/times';
import React, { Fragment } from 'react';
import getWindowDimensions from '../../../../utils/getWindowDimensions';
import ListItemPlaceHolder from './listItemPlaceHolderView';

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
