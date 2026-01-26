const path = require('path');

module.exports = {
    mode: 'production',
    entry: './js/wps.js',
    output: {
        filename: 'wps.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
