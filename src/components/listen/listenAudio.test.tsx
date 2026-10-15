import React from 'react';
import TestRenderer from 'react-test-renderer';

jest.mock('react-native-extended-stylesheet', () => ({
  create: (styles: any) => styles,
  value: jest.fn(() => '#000000'),
}));
jest.mock('../icon', () => ({ Icon: 'Icon' }));
jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));
jest.mock('react-native-video', () => {
  const ReactLib = jest.requireActual('react');
  const Video = ReactLib.forwardRef((props: any, ref: any) => {
    ReactLib.useImperativeHandle(ref, () => ({ seek: jest.fn() }));
    return ReactLib.createElement('Video', props);
  });
  return { __esModule: true, default: Video };
});
jest.mock('@react-native-community/slider', () => 'Slider');

const mockActivate = jest.fn();
const mockDeactivate = jest.fn();
jest.mock('../postHtmlRenderer/speakPlaybackCoordinator', () => ({
  speakPlayback: {
    activate: (stop: any) => mockActivate(stop),
    deactivate: (stop: any) => mockDeactivate(stop),
  },
}));

// eslint-disable-next-line import/first
import { ListenAudio } from './listenAudio';

const TRACKS = [
  { lang: 'es', seconds: 160, url: 'https://audio.test/es.m4a' },
  { lang: 'en', seconds: 150, url: 'https://audio.test/en.m4a' },
];
const POST = { author: 'noelyss', permlink: 'plaza', title: 'Plaza' };

const render = (onExpired = jest.fn()) => {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <ListenAudio post={POST} tracks={TRACKS} uiLanguage="en-US" onExpired={onExpired} />,
    );
  });
  return tree;
};

const video = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAll((n) => (n.type as any) === 'Video')[0];
const byLabel = (tree: TestRenderer.ReactTestRenderer, label: string) =>
  tree.root.find(
    (n) => n.props.accessibilityLabel === label && typeof n.props.onPress === 'function',
  );
const press = (node: TestRenderer.ReactTestInstance) =>
  TestRenderer.act(() => node.props.onPress());

describe('ListenAudio', () => {
  beforeEach(() => {
    mockActivate.mockClear();
    mockDeactivate.mockClear();
  });

  it('loads nothing until the first play, then plays in the background', () => {
    const tree = render();
    expect(video(tree)).toBeUndefined();
    press(byLabel(tree, 'listen.play'));
    const v = video(tree);
    expect(v.props.paused).toBe(false);
    expect(v.props.playInBackground).toBe(true);
    expect(v.props.showNotificationControls).toBe(true);
    expect(v.props.ignoreSilentSwitch).toBe('ignore');
    // the interface language's track, with lock-screen metadata
    expect(v.props.source.uri).toBe('https://audio.test/en.m4a');
    expect(v.props.source.metadata).toMatchObject({ title: 'Plaza', artist: '@noelyss' });
    // it pauses whatever else was playing (3Speak audio)
    expect(mockActivate).toHaveBeenCalled();
  });

  it('cycles the speed up to 2.5x and switches language', () => {
    const tree = render();
    press(byLabel(tree, 'listen.play'));
    const speed = byLabel(tree, 'listen.speed');
    const rates = [video(tree).props.rate];
    for (let i = 0; i < 6; i++) {
      press(speed);
      rates.push(video(tree).props.rate);
    }
    expect(rates).toEqual([1, 1.25, 1.5, 1.75, 2, 2.5, 1]);

    const spanish = tree.root.find(
      (n) =>
        typeof n.props.onPress === 'function' &&
        n.findAll((c) => c.props.children === 'Spanish').length > 0,
    );
    press(spanish);
    expect(video(tree).props.source.uri).toBe('https://audio.test/es.m4a');
  });

  it('follows the lock screen, but not the player reporting a stop while it loads', () => {
    const tree = render();
    press(byLabel(tree, 'listen.play'));
    TestRenderer.act(() => video(tree).props.onLoadStart());
    TestRenderer.act(() =>
      video(tree).props.onPlaybackStateChanged({ isPlaying: false, isSeeking: false }),
    );
    expect(video(tree).props.paused).toBe(false);

    TestRenderer.act(() => video(tree).props.onLoad({ duration: 150 }));
    TestRenderer.act(() =>
      video(tree).props.onPlaybackStateChanged({ isPlaying: false, isSeeking: false }),
    );
    expect(video(tree).props.paused).toBe(true);
    expect(mockDeactivate).toHaveBeenCalled();
  });

  it('renews an expired URL a few times, then stops', async () => {
    const onExpired = jest.fn();
    const tree = render(onExpired);
    press(byLabel(tree, 'listen.play'));
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line no-await-in-loop
      await TestRenderer.act(async () => {
        video(tree).props.onError({});
      });
    }
    expect(onExpired).toHaveBeenCalledTimes(3);
    expect(video(tree).props.paused).toBe(true);
    expect(tree.root.findAll((n) => n.props.children === 'listen.unavailable')).not.toHaveLength(0);
  });

  it('starts the renewal count over once playback moves well past the failure', async () => {
    const onExpired = jest.fn();
    const tree = render(onExpired);
    press(byLabel(tree, 'listen.play'));
    const fail = async () =>
      TestRenderer.act(async () => {
        video(tree).props.onError({});
      });
    await fail();
    await fail();
    await fail();
    expect(onExpired).toHaveBeenCalledTimes(3);
    // the third renewal worked: the audio plays on, a minute further
    TestRenderer.act(() => video(tree).props.onProgress({ currentTime: 60 }));
    await fail();
    expect(onExpired).toHaveBeenCalledTimes(4);
    expect(tree.root.findAll((n) => n.props.children === 'listen.unavailable')).toHaveLength(0);
  });

  it('still stops for a file that keeps failing at the same spot', async () => {
    const onExpired = jest.fn();
    const tree = render(onExpired);
    press(byLabel(tree, 'listen.play'));
    const fail = async () =>
      TestRenderer.act(async () => {
        video(tree).props.onError({});
      });
    await fail();
    await fail();
    await fail();
    // it loads and plays a few seconds, then fails again: not a working renewal
    TestRenderer.act(() => video(tree).props.onProgress({ currentTime: 5 }));
    await fail();
    expect(onExpired).toHaveBeenCalledTimes(3);
    expect(tree.root.findAll((n) => n.props.children === 'listen.unavailable')).not.toHaveLength(0);
  });

  it('says so when the URL cannot be renewed, and retries on request', async () => {
    const onExpired = jest
      .fn()
      .mockRejectedValueOnce(new Error('401'))
      .mockResolvedValue(undefined);
    const tree = render(onExpired);
    press(byLabel(tree, 'listen.play'));
    await TestRenderer.act(async () => {
      video(tree).props.onError({});
    });
    expect(onExpired).toHaveBeenCalledTimes(1);
    expect(video(tree).props.paused).toBe(true);
    const retry = tree.root.find(
      (n) =>
        typeof n.props.onPress === 'function' &&
        n.findAll((c) => c.props.children === 'listen.retry').length > 0,
    );
    await TestRenderer.act(async () => {
      retry.props.onPress();
    });
    expect(onExpired).toHaveBeenCalledTimes(2);
    expect(tree.root.findAll((n) => n.props.children === 'listen.unavailable')).toHaveLength(0);
  });
});
