// Copyright (c) 2025 by Beardon Services, Inc.

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
    AUTHORIZATION: 'Authorization',
    BEARER_PREFIX: 'Bearer',
    REQUEST_ID: 'X-Request-Id',
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
    apiLogLevelCaptions,
    apiLogLevels,
    chalkFormats,
    chalkLayers,
    databaseOperations,
    httpMethods,
    httpRequestHeaders,
    httpResponseHeaders,
    morganFormats,
    winstonLogLevelNames,
    winstonLogLevels,
};
