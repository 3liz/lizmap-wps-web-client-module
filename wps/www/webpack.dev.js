const path = require('path');

module.exports = {
    entry: './js/wps.js',
    output: {
        filename: 'wps.js',
        path: path.resolve(__dirname, '../../tests/lizmap/www/assets/js/wps'),
    },
    mode: 'development',
    watch: true,
};
