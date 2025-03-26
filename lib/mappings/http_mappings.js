// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const enums = require('../enums');

const { httpStatusCodeGroups: hscg } = enums;

const httpStatusCodeGroupMap = [
    { group: hscg.INFORMATIONAL, range: _.range(100, 200) },
    { group: hscg.SUCCESSFUL, range: _.range(200, 300) },
    { group: hscg.REDIRECTION, range: _.range(300, 400) },
    { group: hscg.CLIENT_ERROR, range: _.range(400, 500) },
    { group: hscg.SERVER_ERROR, range: _.range(500, 600) },
];

module.exports = {
    httpStatusCodeGroupMap,
};
