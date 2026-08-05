import React from 'react';
import TestRenderer from 'react-test-renderer';

// The point of "Show Images" is that no bytes move. These tests assert on the
// rendered tree rather than on a flag, because rendering ExpoImage at all --
// even hidden, zero-sized, or transparent -- would fetch the image.

jest.mock('react-native-reanimated', () => ({
  useSharedValue: jest.fn(() => ({ value: 0 })),
  withTiming: jest.fn((v) => v),
}));

jest.mock('react-native-extended-stylesheet', () => ({
  create: (styles: any) => styles,
  value: jest.fn(() => '#000000'),
}));

// Icon pulls in react-native-vector-icons' native font loading.
jest.mock('../icon', () => ({ Icon: 'Icon' }));

jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector: any) => mockUseSelector(selector),
}));

// eslint-disable-next-line import/first
import { AutoHeightImage } from './autoHeightImage';
// eslint-disable-next-line import/first
import { clearRevealedImages } from '../../utils/revealedImages';

const IMG_URL = 'https://images.ecency.com/p/big-photo.jpg';

const setHideImages = (hide: boolean) => mockUseSelector.mockReturnValue(hide);

const render = (imgUrl = IMG_URL) => {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <AutoHeightImage contentWidth={300} imgUrl={imgUrl} isAnchored={false} onPress={jest.fn()} />,
    );
  });
  return tree;
};

// expo-image is globally mocked to the host component 'Image' (see jest.setup).
const imageCount = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType('Image' as any).length;

describe('AutoHeightImage — "Show Images" gating', () => {
  beforeEach(() => {
    clearRevealedImages();
    mockUseSelector.mockReset();
  });

  it('renders the image when "Show Images" is on', () => {
    setHideImages(false);
    expect(imageCount(render())).toBe(1);
  });

  it('mounts no image at all when "Show Images" is off', () => {
    setHideImages(true);
    expect(imageCount(render())).toBe(0);
  });

  it('renders a tappable placeholder in place of the hidden image', () => {
    setHideImages(true);
    const tree = render();
    expect(tree.root.findAllByType('Icon' as any).length).toBe(1);
  });

  it('loads the image once its placeholder is tapped', () => {
    setHideImages(true);
    const tree = render();
    expect(imageCount(tree)).toBe(0);

    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    expect(imageCount(tree)).toBe(1);
  });

  it('keeps a revealed image loaded across remounts, so one tap is enough', () => {
    setHideImages(true);
    const first = render();
    TestRenderer.act(() => {
      first.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    // Same url mounted elsewhere (feed card -> post detail, or a recycled cell).
    expect(imageCount(render())).toBe(1);
  });

  it('does not reveal unrelated images when one is tapped', () => {
    setHideImages(true);
    const tree = render();
    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    expect(imageCount(render('https://images.ecency.com/p/other-photo.jpg'))).toBe(0);
  });
});
