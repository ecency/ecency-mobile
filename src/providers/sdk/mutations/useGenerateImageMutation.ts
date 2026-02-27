import { useGenerateImage } from '@ecency/sdk';
import { useAuth } from '../../../hooks';

export function useGenerateImageMutation() {
  const { username, code } = useAuth();

  return useGenerateImage(username, code);
}
