import React from 'react';
import TestRenderer from 'react-test-renderer';
import { Text, TouchableOpacity } from 'react-native';

jest.mock('react-native-extended-stylesheet', () => ({
  create: (styles: any) => styles,
  value: jest.fn(() => '#000000'),
}));

// Icon pulls in react-native-vector-icons' native font loading.
jest.mock('../../../icon', () => ({ Icon: 'Icon' }));

jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

// eslint-disable-next-line import/first
import QueryErrorRetry from './queryErrorRetryView';

const render = (props: React.ComponentProps<typeof QueryErrorRetry>) => {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(<QueryErrorRetry {...props} />);
  });
  return tree;
};

const messages = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType(Text as any).map((node) => node.props.children);

describe('QueryErrorRetry', () => {
  it('tells a timeout apart from any other failure', () => {
    const timeout = Object.assign(new Error('Request timed out'), { name: 'TimeoutError' });

    expect(messages(render({ error: timeout, onRetry: jest.fn() }))).toContain(
      'alert.request_timed_out',
    );
    expect(messages(render({ error: new Error('boom'), onRetry: jest.fn() }))).toContain(
      'alert.load_failed_retry',
    );
  });

  it('says it is retrying while the retry is in flight, and disables the button', () => {
    const tree = render({ onRetry: jest.fn(), isRetrying: true });

    expect(messages(tree)).toContain('alert.retrying');
    expect(tree.root.findByType(TouchableOpacity as any).props.disabled).toBe(true);
  });

  it('calls onRetry with no arguments', () => {
    // Load-bearing: `refetch` is passed straight in at some call sites, and
    // React Query reads its first argument as options. Handing it the press
    // event would be interpreted as a refetch configuration object.
    const onRetry = jest.fn();
    const tree = render({ onRetry });

    TestRenderer.act(() => {
      tree.root.findByType(TouchableOpacity as any).props.onPress({ nativeEvent: {} });
    });

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith();
  });
});
