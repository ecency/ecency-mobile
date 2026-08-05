import axios from 'axios';

const githubApi = axios.create({
  baseURL: 'https://api.github.com/repos/ecency/vision-mobile/',
});

export default githubApi;
