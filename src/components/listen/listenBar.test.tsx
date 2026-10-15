import React from 'react';
import { Alert } from 'react-native';
import TestRenderer from 'react-test-renderer';

jest.mock('react-native-extended-stylesheet', () => ({
  create: (styles: any) => styles,
  value: jest.fn(() => '#000000'),
}));

jest.mock('../icon', () => ({ Icon: 'Icon' }));

// "id" or "id {values}", so a test can see both the message and what was put in it.
jest.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ id }: { id: string }, values?: object) =>
      values ? `${id} ${JSON.stringify(values)}` : id,
  }),
}));

const mockStatus: { current: any } = { current: undefined };
const mockRefetch = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: (options: any) => ({
    data: options.enabled === false ? undefined : mockStatus.current,
    refetch: mockRefetch,
  }),
}));

const mockMutate = jest.fn();
const mockStatusOptions = jest.fn(
  (author: string, permlink: string, username?: string, code?: string) => ({
    queryKey: ['listen', author, permlink, username, code],
  }),
);
jest.mock('@ecency/sdk', () => ({
  getListenStatusQueryOptions: (...args: any[]) => (mockStatusOptions as any)(...args),
  useListenUnlock: () => ({ mutate: mockMutate, isPending: false }),
  makeIdempotencyKey: () => 'key-1234567890',
}));

const mockAuth: { current: { username?: string; code?: string } } = { current: {} };
jest.mock('../../hooks', () => ({
  useAuth: () => mockAuth.current,
  useAppSelector: () => 'en-US',
}));
jest.mock('../../redux/selectors', () => ({ selectLanguage: jest.fn() }));

const mockLogin = jest.fn();
jest.mock('../../utils/showLoginAlert', () => ({ __esModule: true, default: () => mockLogin() }));
const mockNavigate = jest.fn();
jest.mock('../../navigation/rootNavigation', () => ({
  __esModule: true,
  default: { navigate: (...args: any[]) => mockNavigate(...args) },
}));
jest.mock('../../constants/routeNames', () => ({
  __esModule: true,
  default: { SCREENS: { BOOST: 'Boost' } },
}));
jest.mock('./listenAudio', () => ({ ListenAudio: 'ListenAudio' }));

// eslint-disable-next-line import/first
import { ListenBar } from './listenBar';

const BODY = 'Hola a todos, hoy les comparto un paseo por la plaza de mi ciudad. '.repeat(20);
const LANGS = [
  { lang: 'es', share: 0.54, seconds: 160 },
  { lang: 'en', share: 0.46, seconds: 150 },
];
const POST = {
  author: 'noelyss',
  permlink: 'plaza',
  title: 'Plaza',
  body: BODY,
  parent_author: '',
};

const render = (post: any = POST) => {
  let tree!: TestRenderer.ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(<ListenBar post={post} />);
  });
  return tree;
};

const texts = (tree: TestRenderer.ReactTestRenderer) =>
  tree.root
    .findAll((n) => (n.type as any) === 'Text')
    .map((n) => [].concat(n.props.children).join(''));

const pressText = (tree: TestRenderer.ReactTestRenderer, id: string) => {
  const target = tree.root.find(
    (n) =>
      typeof n.props.onPress === 'function' &&
      n.findAll(
        (c) => (c.type as any) === 'Text' && [].concat(c.props.children).join('').startsWith(id),
      ).length > 0,
  );
  TestRenderer.act(() => target.props.onPress());
};

describe('ListenBar', () => {
  let alert: jest.SpyInstance;

  beforeEach(() => {
    mockStatus.current = undefined;
    mockAuth.current = {};
    mockMutate.mockReset();
    mockLogin.mockReset();
    mockNavigate.mockReset();
    mockStatusOptions.mockClear();
    alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  });

  afterEach(() => alert.mockRestore());

  it('renders nothing for a comment', () => {
    mockStatus.current = { cost: 50, unlocked: false, status: 'none', languages: [] };
    expect(render({ ...POST, parent_author: 'someone' }).toJSON()).toBeNull();
  });

  it('renders nothing for a post the voice cannot read', () => {
    mockAuth.current = { username: 'alice', code: 'token' };
    mockStatus.current = { cost: 50, unlocked: false, status: 'unsupported', languages: [] };
    expect(render().toJSON()).toBeNull();
  });

  it('hides a post in an unreadable script until the server finds a voice', () => {
    const thai = { ...POST, body: 'สวัสดีครับ ทุกคน วันนี้อากาศดีมาก '.repeat(20) };
    mockStatus.current = { cost: 50, unlocked: false, status: 'none', languages: [] };
    expect(render(thai).toJSON()).toBeNull();
    mockStatus.current = { cost: 50, unlocked: false, status: 'none', languages: [LANGS[1]] };
    expect(render(thai).toJSON()).not.toBeNull();
  });

  it('asks a visitor to log in', () => {
    mockStatus.current = { cost: 50, unlocked: false, status: 'none', languages: LANGS };
    const tree = render();
    // the status is asked for without a reader
    expect(mockStatusOptions.mock.calls[0][2]).toBeUndefined();
    pressText(tree, 'listen.login');
    expect(mockLogin).toHaveBeenCalled();
  });

  it('names the languages and confirms before spending', () => {
    mockAuth.current = { username: 'alice', code: 'token' };
    mockStatus.current = { cost: 50, unlocked: false, status: 'none', languages: LANGS };
    const tree = render();
    expect(texts(tree).some((t) => t.startsWith('Spanish + English'))).toBe(true);

    pressText(tree, 'listen.unlock');
    expect(mockMutate).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2];
    TestRenderer.act(() => buttons.find((b: any) => b.text === 'alert.confirm').onPress());
    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(mockMutate.mock.calls[0][0]).toMatchObject({
      author: 'noelyss',
      permlink: 'plaza',
      idempotency_key: 'key-1234567890',
    });
  });

  it('sends a reader short of Points to buy them', () => {
    mockAuth.current = { username: 'alice', code: 'token' };
    mockStatus.current = { cost: 50, unlocked: false, status: 'none', languages: LANGS };
    mockMutate.mockImplementation((_params, { onError, onSettled }) => {
      onError(
        Object.assign(new Error('402'), { status: 402, data: { required: 50, available: 12 } }),
      );
      onSettled();
    });
    const tree = render();
    pressText(tree, 'listen.unlock');
    TestRenderer.act(() =>
      alert.mock.calls[0][2].find((b: any) => b.text === 'alert.confirm').onPress(),
    );
    const [title, message, buttons] = alert.mock.calls[1];
    expect(title).toBe('listen.not_enough_title');
    expect(message).toContain('"available":12');
    buttons.find((b: any) => b.text === 'listen.get_points').onPress();
    expect(mockNavigate).toHaveBeenCalledWith({ name: 'Boost', params: { username: 'alice' } });
  });

  it('shows the place in line, next in line, then the percentage', () => {
    mockAuth.current = { username: 'alice', code: 'token' };
    const preparing = { cost: 50, unlocked: true, status: 'preparing', languages: LANGS };

    mockStatus.current = { ...preparing, queued_ahead: 2, progress: 0 };
    expect(texts(render()).some((t) => t.startsWith('listen.waiting {"n":2}'))).toBe(true);

    mockStatus.current = { ...preparing, queued_ahead: 0, progress: 0 };
    expect(texts(render())).toContain('listen.next_in_line');

    mockStatus.current = { ...preparing, progress: 0.426 };
    expect(texts(render())).toContain('listen.preparing_progress {"n":43}');

    // never 100% before the audio is ready
    mockStatus.current = { ...preparing, progress: 1 };
    expect(texts(render())).toContain('listen.preparing_progress {"n":99}');

    // an older backend: an estimate from the post's length
    mockStatus.current = { ...preparing };
    expect(texts(render())).toContain('listen.preparing_eta {"n":2}');
  });

  it('plays the ready tracks', () => {
    mockAuth.current = { username: 'alice', code: 'token' };
    const tracks = [
      { lang: 'es', seconds: 160, url: 'https://audio.test/es.m4a' },
      { lang: 'en', seconds: 150, url: 'https://audio.test/en.m4a' },
    ];
    mockStatus.current = { cost: 50, unlocked: true, status: 'ready', languages: LANGS, tracks };
    const player = render().root.find((n) => (n.type as any) === 'ListenAudio');
    expect(player.props.tracks).toEqual(tracks);
    expect(mockStatusOptions.mock.calls[0][2]).toBe('alice');
    expect(mockStatusOptions.mock.calls[0][3]).toBe('token');
  });
});
