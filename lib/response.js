// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');

const enums = require('./enums');
const { httpStatusCodeGroupMap } = require('./mappings/http_mappings');

const { httpStatusCodeGroups: hscg } = enums;

function areHeadersSent(res) {
    return typeof (res.headersSent !== 'boolean') ? Boolean(res._header) : res.headersSent;
}

function isResponseFailure(statusCode, disregardStatusCodes = [ ]) {
    if (_.isArray(disregardStatusCodes) && disregardStatusCodes.includes(statusCode)) return false;
    return isResponseStatusCodeClientError(statusCode) || isResponseStatusCodeServerError(statusCode);
}

function isResponseStatusCodeClientError(statusCode) {
    return isResponseStatusCodeInGroup(statusCode, hscg.CLIENT_ERROR);
}

function isResponseStatusCodeInformational(statusCode) {
    return isResponseStatusCodeInGroup(statusCode, hscg.INFORMATIONAL);
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

function isResponseStatusCodeServerError(statusCode) {
    return isResponseStatusCodeInGroup(statusCode, hscg.SERVER_ERROR);
}

function isResponseStatusCodeSuccessful(statusCode) {
    return isResponseStatusCodeInGroup(statusCode, hscg.SUCCESSFUL);
}

function isResponseSuccessful(statusCode) {
    return isResponseStatusCodeSuccessful(statusCode) || isResponseStatusCodeRedirection(statusCode) || isResponseStatusCodeInformational(statusCode);
}

module.exports = {
    areHeadersSent,
    isResponseFailure,
    isResponseSuccessful,
};
