// Copyright (c) 2025 by Beardon Services, Inc.

const ansi256Colors = {
    LOG_LEVEL_DEBUG: 34, // blue
    LOG_LEVEL_ERROR: 31, // red
    LOG_LEVEL_HTTP: 32, // green
    LOG_LEVEL_INFO: 32, // green
    LOG_LEVEL_SILLY: 35, // magenta
    LOG_LEVEL_VERBOSE: 36, // cyan
    LOG_LEVEL_WARNING: 33, // yellow
};

const ansiColors = {
    HTTP_CLIENT_ERROR: 33, // red
    HTTP_INFORMATIONAL: 0,
    HTTP_REDIRECTION: 36, // blue
    HTTP_SERVER_ERROR: 31, // red
    HTTP_SUCCESSFUL: 32, // green
};

const apiLogLevelCaptions = {
    DEFAULT: 'Default',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    HTTP: 'HTTP',
    VERBOSE: 'Verbose',
    DEBUG: 'Debug',
    SILLY: 'Silly',
};

const apiLogLevels = {
    DEFAULT: -1,
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
    HTTP: 3,
    VERBOSE: 4,
    DEBUG: 5,
    SILLY: 6,
};

const chalkFormats = {
    ANSI: 'ansi',
    ANSI256: 'ansi256',
    HEX: 'hex',
    RGB: 'rgb',
};

const chalkLayers = {
    BACKGROUND: 'bg',
    FOREGROUND: 'fg',
};

const databaseOperations = {
    DELETE: 'DELETE',
    INSERT: 'INSERT',
    SELECT: 'SELECT',
    TRUNCATE: 'TRUNCATE',
    UPDATE: 'UPDATE',
};

const hexColors = {
    BLACK: '#000000',
    CONSOLE_WHITE: '#ECECEC',
    DB_DELETE: '#F22613',
    DB_INSERT: '#00B16A',
    DB_SELECT: '#1E90FF',
    DB_TRUNCATE: '#750505',
    DB_UPDATE: '#F9690E',
    HTTP_CONNECT: '#FFFFFF',
    HTTP_DELETE: '#EF968A',
    HTTP_GET: '#67D193',
    HTTP_HEAD: '#68D696',
    HTTP_OPTIONS: '#E55AA8',
    HTTP_PATCH: '#C0A8E1',
    HTTP_POST: '#F4DA7A',
    HTTP_PUT: '#74AEF6',
    HTTP_TRACE: '#FFFFFF',
    OSU_ORANGE: '#FF6600',
};

const httpStatusCodeGroups = {
    INFORMATIONAL: 1,
    SUCCESSFUL: 2,
    REDIRECTION: 3,
    CLIENT_ERROR: 4,
    SERVER_ERROR: 5,
};

const httpMethods = {
    GET: 'GET',
    HEAD: 'HEAD',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    CONNECT: 'CONNECT',
    OPTIONS: 'OPTIONS',
    TRACE: 'TRACE',
    PATCH: 'PATCH',
};

const httpRequestHeaders = {
    ALLOW: 'Allow',
    APP_VERSION: 'App-Version',
    AUTHORIZATION: 'Authorization',
    BEARER_PREFIX: 'Bearer',
    FORWARDED_FOR: 'X-Forwarded-For',
    REQUEST_ID: 'X-Request-Id',
    USER_AGENT: 'User-Agent',
};

const httpResponseHeaders = {
    CONTENT_LENGTH: 'Content-Length',
};

const morganFormats = {
    COMBINED: 'combined',
    COMMON: 'common',
    DEV: 'dev',
    DEV_ENHANCED: ':method :url :status-colored :response-time-format :content-length-format',
    SHORT: 'short',
    TINY: 'tiny',
};

const winstonLogLevelNames = {
    ERROR: 'error',
    WARNING: 'warn',
    INFO: 'info',
    HTTP: 'http',
    VERBOSE: 'verbose',
    DEBUG: 'debug',
    SILLY: 'silly',
};

// using NPM logging levels
const winstonLogLevels = {
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
    HTTP: 3,
    VERBOSE: 4,
    DEBUG: 5,
    SILLY: 6,
};

module.exports = {
    ansi256Colors,
    ansiColors,
    apiLogLevelCaptions,
    apiLogLevels,
    chalkFormats,
    chalkLayers,
    databaseOperations,
    hexColors,
    httpStatusCodeGroups,
    httpMethods,
    httpRequestHeaders,
    httpResponseHeaders,
    morganFormats,
    winstonLogLevelNames,
    winstonLogLevels,
};
