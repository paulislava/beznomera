const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = {
  ...getDefaultConfig(__dirname),
  watchFolders: [path.resolve(__dirname + '/../shared')]
};

module.exports = config;
