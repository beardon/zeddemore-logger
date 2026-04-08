// Copyright (c) 2024-2026 by Beardon Services, Inc.

const _ = require('lodash');
const enums = require('../enums');

const { ansiColors: ac, chalkFormats: cf, hexColors: hc, httpMethods: http, winstonLogLevelNames: wlln } = enums;

const httpStatusColors = [
    { range: _.range(500, 600), style: { format: cf.ANSI, fore: ac.HTTP_SERVER_ERROR, back: null } },
    { range: _.range(400, 500), style: { format: cf.ANSI, fore: ac.HTTP_CLIENT_ERROR, back: null } },
    { range: _.range(300, 400), style: { format: cf.ANSI, fore: ac.HTTP_REDIRECTION, back: null } },
    { range: _.range(200, 300), style: { format: cf.ANSI, fore: ac.HTTP_SUCCESSFUL, back: null } },
    { range: _.range(100, 200), style: { format: cf.ANSI, fore: ac.HTTP_INFORMATIONAL, back: null } },
];

const httpVerbColors = [
    { match: http.CONNECT, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_CONNECT } },
    { match: http.DELETE, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_DELETE } },
    { match: http.GET, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_GET } },
    { match: http.HEAD, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_HEAD } },
    { match: http.OPTIONS, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_OPTIONS } },
    { match: http.PATCH, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_PATCH } },
    { match: http.POST, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_POST } },
    { match: http.PUT, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_PUT } },
    { match: http.TRACE, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_TRACE } },
];

const logLevelColors = [
    { match: wlln.ERROR, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_ERROR, back: null } },
    { match: wlln.WARNING, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_WARNING, back: null } },
    { match: wlln.INFO, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_INFO, back: null } },
    { match: wlln.HTTP, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_HTTP, back: null } },
    { match: wlln.VERBOSE, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_VERBOSE, back: null } },
    { match: wlln.DEBUG, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_DEBUG, back: null } },
    { match: wlln.SILLY, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_SILLY, back: null } },
];

const packageColors = [
    { match: 'AngularJS', style: { format: cf.HEX, fore: hc.PACKAGE_ANGULARJS, back: null } },
    { match: 'Axios', style: { format: cf.HEX, fore: hc.PACKAGE_AXIOS, back: null } },
    { match: 'express', style: { format: cf.HEX, fore: hc.PACKAGE_EXPRESS, back: null } },
    { match: 'Handlebars', style: { format: cf.HEX, fore: hc.PACKAGE_HANDLEBARS, back: null } },
    { match: 'Jimp', style: { format: cf.HEX, fore: hc.PACKAGE_JIMP, back: null } },
    { match: 'MySQL', style: { format: cf.HEX, fore: hc.PACKAGE_MYSQL, back: null } },
    { match: 'Node.js', style: { format: cf.HEX, fore: hc.PACKAGE_NODE_JS, back: null } },
    { match: 'passport', style: { format: cf.HEX, fore: hc.PACKAGE_PASSPORT, back: null } },
    { match: 'PostgreSQL', style: { format: cf.HEX, fore: hc.PACKAGE_POSTGRESQL, back: null } },
    { match: 'Redis', style: { format: cf.HEX, fore: hc.PACKAGE_REDIS, back: null } },
    { match: 'sequelize', style: { format: cf.HEX, fore: hc.PACKAGE_SEQUELIZE, back: null } },
];

module.exports = {
    httpStatusColors,
    httpVerbColors,
    logLevelColors,
    packageColors,
};
