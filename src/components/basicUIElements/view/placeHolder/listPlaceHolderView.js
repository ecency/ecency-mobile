/* eslint-disable radix */
import React, { Fragment } from 'react';
import { useWindowDimensions } from 'react-native';
import times from 'lodash/times';

import ListItemPlaceHolder from './listItemPlaceHolderView';

const ListPlaceHolderView = () => {
  const dim = useWindowDimensions();

  const ratio = (dim.height - 300) / 50;
  const listElements = [];

  times(parseInt(ratio), (i) => {
    listElements.push(<ListItemPlaceHolder key={i} />);
  });

  return <Fragment>{listElements}</Fragment>;
};
export default ListPlaceHolderView;
/* eslint-enable */
