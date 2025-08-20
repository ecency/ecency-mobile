import { ForwardRefExoticComponent, RefAttributes } from 'react';
import { type IOComponentProps, withIO } from 'react-native-intersection-observer';
import { FlashList, FlashListProps } from '@shopify/flash-list';

export type IOFlashListController = FlashList<any>;
export type IOFlashListProps<ItemT> = IOComponentProps & FlashListProps<ItemT>;

const IOFlashList = withIO(FlashList, [
  'scrollToIndex',
  'scrollToOffset',
  'scrollToEnd',
  'scrollToItem',
  'getScrollResponder',
  'getScrollableNode',
  'recordInteraction',
  'flashScrollIndicators',
]);

export default IOFlashList as unknown as ForwardRefExoticComponent<
  IOFlashListProps<any> & RefAttributes<IOFlashListController>
>;
