import bugsnagInstance from '../../config/bugsnag';
import githubApi from '../../config/githubApi';

export const fetchLatestAppVersion = async () => {
  try {
    const res = await githubApi.get('/releases/latest');
    const { data } = res;
    if (!data || !data.tag_name) {
      throw new Error('Tag name not available');
    }

    return data.tag_name;
  } catch (error) {
    bugsnagInstance.notify(error);
    throw error;
  }
};
