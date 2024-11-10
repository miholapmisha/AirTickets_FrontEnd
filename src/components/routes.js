const path = require('path');
const {PAGE_FOLDER} = require('./constants');

const PATHNAME_TO_FILEPATH = new Map([
    ['/', path.join(PAGE_FOLDER, '/homepage/index.html')],
    ['/login', path.join(PAGE_FOLDER, '/login-page/index.html')],
    ['/register', path.join(PAGE_FOLDER, '/register-page/index.html')]
]);
const NOT_FOUND_FILEPATH = path.join(PAGE_FOLDER, '/404/index.html');

module.exports = { PATHNAME_TO_FILEPATH, NOT_FOUND_FILEPATH };