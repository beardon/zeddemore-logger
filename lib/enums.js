// Copyright (c) 2025-2026 by Beardon Services, Inc.

function doesEnumInclude(set, value) {
    for (const key in set) {
        if (set[ key ] === value) return true;
    }
    return false;
}

const ansiColors = {
    HTTP_CLIENT_ERROR: 33, // red
    HTTP_INFORMATIONAL: 0, // white
    HTTP_REDIRECTION: 36, // blue
    HTTP_SERVER_ERROR: 31, // red
    HTTP_SUCCESSFUL: 32, // green
    LOG_LEVEL_DEBUG: 34, // blue
    LOG_LEVEL_ERROR: 31, // red
    LOG_LEVEL_HTTP: 32, // green
    LOG_LEVEL_INFO: 32, // green
    LOG_LEVEL_SILLY: 35, // magenta
    LOG_LEVEL_VERBOSE: 36, // cyan
    LOG_LEVEL_WARNING: 33, // yellow
};

const chalkFormats = {
    ANSI: 'ansi',
    HEX: 'hex',
    RGB: 'rgb',
};

const chalkLayers = {
    BACKGROUND: 'bg',
    FOREGROUND: 'fg',
};

const hexColors = {
    BEARDON_RED: '#951A1D',
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
    PACKAGE_ANGULARJS: '#C04737',
    PACKAGE_AXIOS: '#6200e1',
    PACKAGE_EXPRESS: '#F7DF1E',
    PACKAGE_HANDLEBARS: '#F0772B',
    PACKAGE_JIMP: '#FF0000',
    PACKAGE_MYSQL: '#00618A',
    PACKAGE_NODE_JS: '#689F63',
    PACKAGE_NODEMAILER: '#29ABE2',
    PACKAGE_PASSPORT: '#51E492',
    PACKAGE_PDFKIT: '#DB000D',
    PACKAGE_POSTGRESQL: '#336791',
    PACKAGE_REDIS: '#C23936',
    PACKAGE_SEQUELIZE: '#00AFEF',
    PACKAGE_ZEDDEMORE: '#E2B68F',
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
    ACCEPT_LANGUAGE: 'Accept-Language',
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

const logLevelTypes = {
    CONSOLE: 'console',
    EMAIL: 'email',
};

const morganFormats = {
    COMBINED: 'combined',
    COMMON: 'common',
    DEV: 'dev',
    SHORT: 'short',
    TINY: 'tiny',
    ZEDDEMORE: 'zeddemore', // added for `zeddemore-logger`
};

const morganFormatTokens = {
    CONTENT_LENGTH_FORMAT: 'content-length-format', // added for `zeddemore-logger`
    DATE: 'date', // :date[format]
    DECODED_URL: 'decoded-url', // added for `zeddemore-logger`
    HTTP_VERSION: 'http-version',
    METHOD: 'method',
    REFERRER: 'referrer',
    REMOTE_ADDR: 'remote-addr',
    REMOTE_USER: 'remote-user',
    REQ: 'req', // :req[header]
    RES: 'res', // :res[header]
    RESPONSE_TIME: 'response-time', // :response-time[digits]
    RESPONSE_TIME_FORMAT: 'response-time-format', // added for `zeddemore-logger`
    STATUS: 'status',
    STATUS_COLORED: 'status-colored', // added for `zeddemore-logger`
    TOTAL_TIME: 'total-time', // :total-time[digits]
    URL: 'url',
    USER_AGENT: 'user-agent',
};

const winstonFormats = {
    COLORIZE: 'colorize',
    JSON: 'json',
    METADATA: 'metadata',
    PRETTY_PRINT: 'pretty_print',
    SIMPLE: 'simple',
    SPLAT: 'splat',
    TIMESTAMP: 'timestamp',
    ZEDDEMORE_INFO_MUTATION: 'zeddemore_info_mutation',
    ZEDDEMORE_LABEL: 'zeddemore_label',
    ZEDDEMORE_PRINTF: 'zeddemore_printf',
    ZEDDEMORE_TIMESTAMP: 'zeddemore_timestamp',
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

const winstonTransports = {
    CONSOLE: 'console',
    EMAIL: 'email',
};

const zeddemoreLogLevelCaptions = {
    DEFAULT: 'Default',
    ERROR: 'Error',
    WARNING: 'Warning',
    INFO: 'Info',
    HTTP: 'HTTP',
    VERBOSE: 'Verbose',
    DEBUG: 'Debug',
    SILLY: 'Silly',
};

module.exports = {
    doesEnumInclude,
    ansiColors,
    chalkFormats,
    chalkLayers,
    hexColors,
    httpStatusCodeGroups,
    httpMethods,
    httpRequestHeaders,
    httpResponseHeaders,
    logLevelTypes,
    morganFormats,
    morganFormatTokens,
    winstonFormats,
    winstonLogLevelNames,
    winstonLogLevels,
    winstonTransports,
    zeddemoreLogLevelCaptions,
};
