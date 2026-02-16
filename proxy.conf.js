const dotenv = require('dotenv');

dotenv.config();

const API_TARGET = process.env.API_TARGET || 'http://localhost:8080';
const WS_TARGET = process.env.WS_TARGET || 'ws://localhost:8080';

module.exports = {
  "/api": {
    "target": API_TARGET,
    "secure": false,
    "changeOrigin": true
  },
  "/ws": {
    "target": WS_TARGET,
    "secure": false,
    "ws": true
  }
};
