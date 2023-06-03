const axios = require('axios');

// Create an instance
const Axios = axios.create();

// Add an interceptor to modify the request config
Axios.interceptors.request.use((config) => {
  // Modify headers to mimic Chrome browser
  config.headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36';
  config.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9';
  config.headers['timeout'] = '15000';
  return config;
});

module.exports = {
  Axios
}