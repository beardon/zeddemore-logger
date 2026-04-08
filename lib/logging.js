// Copyright (c) 2025-2026 by Beardon Services, Inc.

const _ = require('lodash');

const defaults = require('./defaults');
const enums = require('./enums');
const { logLevelMap } = require('./mappings/log_mappings');

const { doesEnumInclude } = enums;

function isMorganFormat(format) {
    return doesEnumInclude(enums.morganFormats, format);
}

function isWinstonLogLevel(level) {
    if (!_.isInteger(level) && (!_.isString(level) || !level.length)) return false;
    if (_.isInteger(level)) return isWinstonLogLevelId(level);
    if (_.isString(level)) return isWinstonLogLevelName(level);
    return false;
}

function isWinstonLogLevelId(id) {
    if (!_.isInteger(id)) return false;
    return !!(_.find(logLevelMap, { winstonLevel: id }))
}

function isWinstonLogLevelName(name) {
    if (!_.isString(name)) return false;
    return !!(_.find(logLevelMap, { winstonName: name }))
}

function isWinstonTransportId(winstonTransportId) {
    return doesEnumInclude(enums.winstonTransportIds, winstonTransportId);
}

/**
 * Convert a Winston log level ID to a name
 * @param levelId {number}
 * @returns {string}
 */
function winstonLogLevelIdName(levelId) {
    if (!isWinstonLogLevelId(levelId)) return defaults.winstonLogLevelName;
    const logLevelEntry =  _.find(logLevelMap, { winstonLevel: levelId });
    return (logLevelEntry ? logLevelEntry.winstonName : null) || defaults.winstonLogLevelName;
}

/**
 * Convert a Winston log level to a name
 * @param logLevel {number|string}
 * @returns {string}
 */
function winstonLogLevelName(logLevel) {
    if (!isWinstonLogLevel(logLevel)) return defaults.winstonLogLevelName;
    if (_.isString(logLevel)) return logLevel;
    return winstonLogLevelIdName(logLevel);
}

/**
 * Monkey patch console to allow unlimited depth with `console.dirp`
 */
function monkeyPatchConsole(methodNames = [ defaults.consoleDirExtensionMethodName ], colors = defaults.consoleDirExtensionColors, depth = defaults.consoleDirExtensionDepth, showHidden = defaults.consoleDirExtensionShowHidden) {
    if (!_.isArray(methodNames)) methodNames = [ methodNames ];
    const _colors = _.isBoolean(colors) ? colors : defaults.consoleDirExtensionColors;
    const _depth = _.isInteger(depth) ? depth : defaults.consoleDirExtensionDepth;
    const _showHidden = _.isBoolean(showHidden) ? showHidden : defaults.consoleDirExtensionShowHidden;
    for (const methodName of methodNames) {
        if (!!console[ methodName ]) continue;
        console[ methodName ] = function(...args) {
            console.dir(args, { colors: _colors, depth: _depth, showHidden: _showHidden });
        };
    }
}

module.exports = {
    isMorganFormat,
    isWinstonLogLevel,
    isWinstonLogLevelId,
    isWinstonTransportId,
    monkeyPatchConsole,
    winstonLogLevelIdName,
    winstonLogLevelName,
};
