import axios from 'axios';

const githubApi = axios.create({
  baseURL: 'https://api.github.com/repos/ecency/ecency-mobile/',
});

export default githubApi;
