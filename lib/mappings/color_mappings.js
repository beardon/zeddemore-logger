// Copyright (c) 2024-2025 by Beardon Services, Inc.

const _ = require('lodash');
const enums = require('../enums');

const { databaseOperations: dbo, chalkFormats: cs, httpMethods: http, winstonLogLevels: wll } = enums;

const databaseOperationColors = [
    { match: dbo.DELETE, style: { format: cs.HEX, fore: '#F22613', back: null } },
    { match: dbo.INSERT, style: { format: cs.HEX, fore: '#00B16A', back: null } },
    { match: dbo.SELECT, style: { format: cs.HEX, fore: '#1E90FF', back: null } },
    { match: dbo.TRUNCATE, style: { format: cs.HEX, fore: '#750505', back: null } },
    { match: dbo.UPDATE, style: { format: cs.HEX, fore: '#F9690E', back: null } },
];

const httpStatusColors = [
    { range: _.range(500, 600), style: { format: cs.ANSI, fore: 31, back: null } },
    { range: _.range(400, 500), style: { format: cs.ANSI, fore: 33, back: null } },
    { range: _.range(300, 400), style: { format: cs.ANSI, fore: 36, back: null } },
    { range: _.range(200, 300), style: { format: cs.ANSI, fore: 32, back: null } },
    { range: _.range(100, 200), style: { format: cs.ANSI, fore: 0, back: null } },
];

const httpVerbColors = [
    { match: http.GET, style: { format: cs.HEX, fore: '#000000', back: '#67D193' } },
    { match: http.HEAD, style: { format: cs.HEX, fore: '#000000', back: '#68D696' } },
    { match: http.POST, style: { format: cs.HEX, fore: '#000000', back: '#F4DA7A' } },
    { match: http.PUT, style: { format: cs.HEX, fore: '#000000', back: '#74AEF6' } },
    { match: http.DELETE, style: { format: cs.HEX, fore: '#000000', back: '#EF968A' } },
    { match: http.CONNECT, style: { format: cs.HEX, fore: '#000000', back: '#FFFFFF' } },
    { match: http.OPTIONS, style: { format: cs.HEX, fore: '#000000', back: '#E55AA8' } },
    { match: http.TRACE, style: { format: cs.HEX, fore: '#000000', back: '#FFFFFF' } },
    { match: http.PATCH, style: { format: cs.HEX, fore: '#000000', back: '#C0A8E1' } },
];

const logLevelColors = [
    { match: wll.ERROR, style: { format: cs.ANSI256, fore: 31, back: null } }, // red
    { match: wll.WARNING, style: { format: cs.ANSI256, fore: 33, back: null } }, // yellow
    { match: wll.INFO, style: { format: cs.ANSI256, fore: 32, back: null } }, // green
    { match: wll.HTTP, style: { format: cs.ANSI256, fore: 32, back: null } },
    { match: wll.VERBOSE, style: { format: cs.ANSI256, fore: 36, back: null } }, // cyan
    { match: wll.DEBUG, style: { format: cs.ANSI256, fore: 34, back: null } }, // blue
    { match: wll.SILLY, style: { format: cs.ANSI256, fore: 35, back: null } }, // magenta
];

module.exports = {
    databaseOperationColors,
    httpStatusColors,
    httpVerbColors,
    logLevelColors,
};
