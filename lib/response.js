// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');

const enums = require('./enums');
const { httpStatusCodeGroupMap } = require('./mappings/http_mappings');

const { httpStatusCodeGroups: hscg } = enums;

function areHeadersSent(res) {
    return typeof (res.headersSent !== 'boolean') ? Boolean(res._header) : res.headersSent;
}

function isResponseStatusCodeInGroup(statusCode, group) {
    if (!statusCode || !group) return false;
    const httpStatusCodeGroupMapEntry = _.find(httpStatusCodeGroupMap, { group });
    if (!httpStatusCodeGroupMapEntry) return false;
    return httpStatusCodeGroupMapEntry.range.includes(+statusCode);
}

function isResponseStatusCodeRedirection(statusCode) {
    return isResponseStatusCodeInGroup(statusCode, hscg.REDIRECTION);
}

function isResponseStatusCodeSuccessful(statusCode) {
    return isResponseStatusCodeInGroup(statusCode, hscg.SUCCESSFUL);
}

function isResponseSuccessful(statusCode) {
    return isResponseStatusCodeSuccessful(statusCode) || isResponseStatusCodeRedirection(statusCode);
}

module.exports = {
    areHeadersSent,
    isResponseSuccessful,
};
