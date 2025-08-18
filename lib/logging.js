// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');

const defaults = require('./defaults');
const enums = require('./enums');
const { logLevelMap } = require('./mappings/log_mappings');

const { doesEnumInclude } = enums;

function isMorganFormat(format) {
    return doesEnumInclude(enums.morganFormats, format);
}

function isValidLogLevel(logLevel) {
    if (!logLevel) return false;
    if (_.isInteger(logLevel)) return isValidLogLevelId(logLevel);
    if (_.isString(logLevel)) return isValidLogLevelName(logLevel);
    return false;
}

function isValidLogLevelId(logLevelId) {
    if (!_.isInteger(logLevelId)) return false;
    return !!(_.find(logLevelMap, { winstonLevel: logLevelId }))
}

function isValidLogLevelName(logLevelName) {
    if (!_.isString(logLevelName)) return false;
    return !!(_.find(logLevelMap, { winstonName: logLevelName }))
}

/**
 * Convert a log level ID to a Winston log level name
 * @param levelId {number}
 * @returns {string}
 */
function logLevelIdToWinstonLogLevelName(levelId) {
    if (!isValidLogLevelId(levelId)) return defaults.winstonLogLevelName;
    const logLevelEntry =  _.find(logLevelMap, { winstonLevel: levelId });
    return (logLevelEntry ? logLevelEntry.winstonName : null) || defaults.winstonLogLevelName;
}

/**
 * Convert a log level to a Winston log level name
 * @param logLevel {number|string}
 * @returns {string}
 */
function logLevelToWinstonLogLevelName(logLevel) {
    if (!isValidLogLevel(logLevel)) return defaults.winstonLogLevelName;
    if (_.isString(logLevel)) return logLevel;
    return logLevelIdToWinstonLogLevelName(logLevel);
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
    isValidLogLevel,
    logLevelIdToWinstonLogLevelName,
    logLevelToWinstonLogLevelName,
    monkeyPatchConsole,
};
