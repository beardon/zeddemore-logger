// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const enums = require('../enums');

const { databaseOperations: dbo, httpMethods: http } = enums;

const databaseOperationColors = [
    { match: dbo.DELETE, fore: '#F22613', back: null },
    { match: dbo.INSERT, fore: '#00B16A', back: null },
    { match: dbo.SELECT, fore: '#1E90FF', back: null },
    { match: dbo.TRUNCATE, fore: '#750505', back: null },
    { match: dbo.UPDATE, fore: '#F9690E', back: null },
];

const httpStatusColors = [
    { range: _.range(500, 600), ansi: 31 },
    { range: _.range(400, 500), ansi: 33 },
    { range: _.range(300, 400), ansi: 36 },
    { range: _.range(200, 300), ansi: 32 },
    { range: _.range(100, 200), ansi: 0 },
];

const httpVerbColors = [
    { match: http.GET, fore: '#000000', back: '#67D193' },
    { match: http.HEAD, fore: '#000000', back: '#68D696' },
    { match: http.POST, fore: '#000000', back: '#F4DA7A' },
    { match: http.PUT, fore: '#000000', back: '#74AEF6' },
    { match: http.DELETE, fore: '#000000', back: '#EF968A' },
    { match: http.CONNECT, fore: '#000000', back: '#FFFFFF' },
    { match: http.OPTIONS, fore: '#000000', back: '#E55AA8' },
    { match: http.TRACE, fore: '#000000', back: '#FFFFFF' },
    { match: http.PATCH, fore: '#000000', back: '#C0A8E1' },
];

module.exports = {
    databaseOperationColors,
    httpStatusColors,
    httpVerbColors,
};
