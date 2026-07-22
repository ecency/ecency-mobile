import axios from 'axios';
import { upload } from './imageApi';
import { SIGN_IMAGE_UNAVAILABLE } from '../constants/imageUpload';

jest.mock('axios');
jest.mock('react-native-config', () => ({
  __esModule: true,
  default: { NEW_IMAGE_API: 'https://images.example.com' },
}));

const mockedCreate = axios.create as unknown as jest.Mock;
const mockPost = jest.fn();

describe('imageApi upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { url: 'https://images.example.com/DQmHash' } });
    mockedCreate.mockReturnValue({
      post: mockPost,
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
    });
  });

  it.each([
    ['undefined', undefined],
    ['empty', ''],
  ])('rejects without issuing a request when the signature is %s', async (_label, signature) => {
    await expect(upload({} as FormData, 'foo', signature)).rejects.toThrow(SIGN_IMAGE_UNAVAILABLE);

    // The point of the guard: no request is built at all, so the literal string
    // "undefined" can never reach the image server as an upload signature.
    expect(mockedCreate).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('posts to a signature-scoped url when the signature is present', async () => {
    await upload({} as FormData, 'foo', 'signed-token');

    expect(mockedCreate).toHaveBeenCalledTimes(1);
    const { baseURL } = mockedCreate.mock.calls[0][0];
    expect(baseURL).toBe('https://images.example.com/hs/signed-token');
    expect(baseURL).not.toContain('undefined');
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
