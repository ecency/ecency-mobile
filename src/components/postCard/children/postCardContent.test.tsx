import React from 'react';
import TestRenderer from 'react-test-renderer';

jest.mock('react-native-extended-stylesheet', () => ({
  create: (styles: any) => styles,
  value: jest.fn(() => '#000000'),
}));

jest.mock('../../icon', () => ({ Icon: 'Icon' }));

jest.mock('react-intl', () => ({
  useIntl: () => ({ formatMessage: ({ id }: { id: string }) => id }),
}));

jest.mock('@shopify/flash-list', () => ({
  useLayoutState: (initial: any) => [initial, jest.fn()],
}));

jest.mock('@ecency/render-helper', () => ({
  proxifyImageSrc: jest.fn((url: string) => url),
}));

// The postCard container re-exports through the component barrel, which drags in
// the store -> navigation -> native-module chain. Only the enum is needed here.
jest.mock('../container/postCard', () => ({
  PostCardActionIds: { NAVIGATE: 'NAVIGATE' },
}));

const mockUseSelector = jest.fn();
jest.mock('react-redux', () => ({
  useSelector: (selector: any) => mockUseSelector(selector),
}));

// eslint-disable-next-line import/first
import { PostCardContent } from './postCardContent';
// eslint-disable-next-line import/first
import { clearRevealedImages } from '../../../utils/revealedImages';

const setHideImages = (hide: boolean) => mockUseSelector.mockReturnValue(hide);

const render = (content: any) => {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(
      <PostCardContent content={content} nsfw="1" handleCardInteraction={jest.fn()} />,
    );
  });
  return tree;
};

const withImage = {
  author: 'a',
  permlink: 'p',
  title: 'A post with a photo',
  summary: 's',
  image: 'https://images.ecency.com/p/cover.jpg',
  thumbnail: 'https://images.ecency.com/p/thumb.jpg',
};

// A text-only post: parsePost leaves thumbnail unset, so postCardContent falls
// back to the remote "no image" graphic.
const textOnly = { author: 'a', permlink: 'p2', title: 'Text only', summary: 's' };

const nsfwPost = { ...withImage, permlink: 'p3', nsfw: true };

const imageCount = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType('Image').length;
const placeholderCount = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root.findAllByType('Icon').length;

describe('PostCardContent — "Show Images" gating', () => {
  beforeEach(() => {
    clearRevealedImages();
    mockUseSelector.mockReset();
  });

  it('renders the thumbnail when "Show Images" is on', () => {
    setHideImages(false);
    expect(imageCount(render(withImage))).toBe(1);
  });

  it('offers a tap-to-load placeholder instead of the thumbnail when off', () => {
    setHideImages(true);
    const tree = render(withImage);

    expect(imageCount(tree)).toBe(0);
    expect(placeholderCount(tree)).toBe(1);
  });

  it('loads the thumbnail once the placeholder is tapped', () => {
    setHideImages(true);
    const tree = render(withImage);

    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });

    expect(imageCount(tree)).toBe(1);
  });

  it('offers no placeholder on a post that has no image', () => {
    setHideImages(true);
    const tree = render(textOnly);

    // Nothing to load, so nothing to fetch and nothing to tap.
    expect(imageCount(tree)).toBe(0);
    expect(placeholderCount(tree)).toBe(0);
  });

  it('offers no placeholder for the NSFW graphic, which is moderation not content', () => {
    setHideImages(true);
    const tree = render(nsfwPost);

    expect(imageCount(tree)).toBe(0);
    expect(placeholderCount(tree)).toBe(0);
  });

  it('still shows the NSFW graphic when "Show Images" is on', () => {
    setHideImages(false);
    expect(imageCount(render(nsfwPost))).toBe(1);
  });

  it('keeps a GIF revealed across a rotation, despite the width-stamped proxy url', () => {
    setHideImages(true);
    // The GIF branch builds imageUri via proxifyImageSrc(original, imgWidth, ...),
    // so the rendered url changes with the viewport. The reveal must not.
    const gifPost = {
      ...withImage,
      permlink: 'p4',
      json_metadata: { image: ['https://images.ecency.com/p/anim.gif'] },
    };

    const tree = render(gifPost);
    TestRenderer.act(() => {
      tree.root.findByProps({ accessibilityRole: 'button' }).props.onPress();
    });
    expect(imageCount(tree)).toBe(1);

    // Remount as if the device rotated: a new proxy width, same source gif.
    expect(imageCount(render(gifPost))).toBe(1);
  });
});
