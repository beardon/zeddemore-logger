// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const chalk = require('chalk');
const { createLogger: createWinstonLogger, format, transports } = require('winston');
const morgan = require('morgan');
const sizeof = require('object-sizeof');
const { v4: uuid } = require('uuid');

const { areHeadersSent, getRequestResponseTime, parseRequest } = require('./http');
const { chalkHttpStatus, chalkHttpVerb, stringToIdempotentHexColor } = require('./color');
const { convertBytes } = require('./math');
const { convertMilliseconds } = require('./date');
const enums = require('./enums');
const { logLevelMap } = require('./mappings/log_mappings');

const { colorize, combine, label, metadata, printf, timestamp } = format;
const { morganFormats: mf, httpRequestHeaders: rqh, httpResponseHeaders: rsh, winstonLogLevelNames: wlln, winstonLogLevels: wll } = enums;

const COLOR_CONSOLE_WHITE_HEX = '#ECECEC';
const DEFAULT_REQUEST_ID_ATTRIBUTE = 'requestId';
const DEFAULT_USER_LOG_LEVEL = -1;
const WINSTON_CONSOLE_TRANSPORT_NAME = 'console';

function massageLogLevel(logLevel) {
    if (!logLevel) return wlln.VERBOSE;
    if (!_.isInteger(logLevel)) return logLevel;
    return winstonLogLevelIdToName(logLevel);
}

function winstonLogLevelIdToName(levelId) {
    const logLevelEntry =  _.find(logLevelMap, { winstonLevel: levelId });
    return logLevelEntry ? logLevelEntry.winstonName : wlln.HTTP;
}

class ZeddemoreLogger {

    constructor(options) {
        options = options || { };
        this.additionalWriteFn = options.additionalWriteFn || null;
        this.defaultLabel = options.defaultLabel || 'zeddemore-logger';
        this.disableMorganLogging = options.hasOwnProperty('disableMorganLogging') ? options.disableMorganLogging : false;
        this.displayCaller = options.hasOwnProperty('displayCaller') ? options.displayUsername : true;
        this.displayIpAddress = options.hasOwnProperty('displayIpAddress') ? options.displayIpAddress : true;
        this.displayRequestId = options.hasOwnProperty('displayRequestId') ? options.displayRequestId : true;
        this.customCallerSettings = options.customCallerSettings || [ ];
        this.defaultUserLogLevel = options.defaultUserLogLevel || DEFAULT_USER_LOG_LEVEL;
        this.forceLogLevel = options.hasOwnProperty('forceLogLevel') ? options.forceLogLevel : false;
        this.logLevel = options.hasOwnProperty('logLevel') ? options.logLevel : wll.INFO;
        this.morganFormat = options.morganFormat || mf.DEV_ENHANCED;
        this.timestampFormat = options.timestampFormat || 'YYYY-MM-DD HH:mm:ss';
        this.requestIdAttribute = options.requestIdAttribute || DEFAULT_REQUEST_ID_ATTRIBUTE;
        this.userGetFn = options.userGetFn || this.#userGetFn;
    }

    #buildWinstonFormat = (options, additionalFormats = [ ]) =>{
        options = options || { };
        const colorizedTemplate = this.#colorizedTemplate.bind(this);
        const formats = [
            format((info) => {
                info.id = info.id || options.id || null;
                info.ip = info.ip || options.ip || null;
                info.user = info.user || options.user || null;
                return info;
            })(),
            colorize(),
            label({ label: options.label || this.defaultLabel }),
            timestamp({ format: this.timestampFormat }),
            metadata(),
            printf(this.#colorizedTemplate),
        ];
        return combine(...additionalFormats.concat(formats));
    }

    #buildWinstonTransport = (logLevel = this.logLevel) => {
        logLevel = logLevel || this.logLevel;
        const level = winstonLogLevelIdToName(logLevel);
        return new transports.Console({ level, name: WINSTON_CONSOLE_TRANSPORT_NAME });
    }

    #buildWinstonTransports = (logLevel = this.logLevel, additionalTransports = [ ]) => {
        return additionalTransports.concat([ this.#buildWinstonTransport(logLevel) ]);
    }

    #callerToHexColor = (caller) => {
        if (!caller) return COLOR_CONSOLE_WHITE_HEX;
        const customCallerSetting = _.find(this.customCallerSettings, { caller });
        if (customCallerSetting && customCallerSetting.color && customCallerSetting.color.fore) return customCallerSetting.color.fore;
        return stringToIdempotentHexColor(caller, true);
    }

    #colorizeResponse(message) {
        const verb = message.split(' ')[ 0 ];
        return chalkHttpVerb(verb, message);
    }

    #colorizedTemplate = (info) => {
        const id = info.metadata.id ? info.metadata.id.substring(0, 8) : null;
        const subId = info.metadata.subId || null;
        const caller = info.metadata.caller || info.metadata.user || null;
        const ipAddress = info.metadata.ip || null;
        const prefix = info.metadata.prefix || null;
        const isError = (info.level.indexOf(wlln.ERROR) > -1);
        const leaveUncompressed = isError || info.metadata.raw;
        const idHexColor = stringToIdempotentHexColor(id, true);
        const callerColorSource = caller || ipAddress;
        const callerHexColor = this.#callerToHexColor(callerColorSource);
        const parts = [ ];
        parts.push(info.metadata.timestamp);
        parts.push(`[${ info.metadata.target || info.metadata.label }]`);
        parts.push(`${ info.level }:`);
        const fullId = '🧵' + id + (subId ? `[${ subId }]` : '');
        if (id && this.displayRequestId) parts.push(chalk.bold.hex(idHexColor)(fullId));
        const callerParts = [ ];
        if (caller && this.displayCaller) {
            const customCallerSettings = _.find(this.customCallerSettings, { caller });
            const logPrefix = customCallerSettings ? customCallerSettings.logPrefix : null;
            callerParts.push(logPrefix ? logPrefix + caller : caller);
        }
        if (ipAddress && this.displayIpAddress) callerParts.push(ipAddress);
        const fullCaller = callerParts.join('@');
        if (fullCaller) parts.push(`<${ chalk.underline.hex(callerHexColor).bold(fullCaller) }>`);
        if (prefix) parts.push(`[${ prefix }]`);
        let message = Array.isArray(info.message) ? info.message.join('\n') : info.message;
        message = _.isObject(message) ? JSON.stringify(message) : message;
        parts.push(leaveUncompressed ? message : message.replace(/(\n?\s+)/g, ' '));
        if (info.err) parts.push(info.err);
        return isError ? chalk.red(parts.join(' ')) : parts.join(' ');
    }

    /**
     * Create a Winston Logger
     * @param [options] {Object}
     * @returns {Logger}
     */
    createLogger = (options) => {
        options = options || { };
        return createWinstonLogger({
            format: this.#buildWinstonFormat(options, options.formats),
            transports: this.#buildWinstonTransports(options.level, options.transports),
        });
    }

    createRequestLogger = (requestId = null, ipAddress = null) => {
        requestId = requestId || this.#generateUuid();
        const loggerOptions = { id: requestId };
        if (ipAddress) loggerOptions.ip = ipAddress;
        return this.createLogger(loggerOptions);
    }

    createUserLogger = (requestId = null, username = null, logLevel = this.defaultUserLogLevel, ipAddress = null) => {
        requestId = requestId || this.#generateUuid();
        logLevel = logLevel || this.defaultUserLogLevel;
        const loggerOptions = { id: requestId, level: logLevel, user: username };
        if (ipAddress) loggerOptions.ip = ipAddress;
        return this.createLogger(loggerOptions);
    }

    #generateUuid() {
        return uuid(null, null, null);
    }

    #getRequestId = (req) => {
        if (!req) return null;
        return req[ this.requestIdAttribute ];
    }

    #initializeMorgan() {
        function buildContentLengthFormatToken(res) {
            const contentLength = convertBytes(res.get('content-length'), { digits: 2 });
            return contentLength ? ` - ${ contentLength }` : '';
        }
        function buildResponseTimeFormatToken(req, res) {
            const responseTime = getRequestResponseTime(req, res);
            return responseTime ? convertMilliseconds(responseTime, { digits: 0 }) : '-';
        }
        function buildStatusColoredToken(res) {
            const statusCode = areHeadersSent(res) ? res.statusCode : null;
            if (!statusCode) return '-';
            return chalkHttpStatus(statusCode);
        }
        morgan.token('content-length-format', (req, res) => { return buildContentLengthFormatToken(res); });
        morgan.token('response-time-format', (req, res) => { return buildResponseTimeFormatToken(req, res); });
        morgan.token('status-colored', (req, res) => { return buildStatusColoredToken(res); });
    }

    static log(options) {
        options = options || { };
        const logger = options.logger || (options.user ? options.user.logger : null) || ((app && app.locals) ? app.locals.logger : null);
        if (logger) return logger;
        const zeddemoreLogger = new ZeddemoreLogger();
        return zeddemoreLogger.createLogger(options);
    }

    morganMiddleware = (options) => {
        options = options || { };
        const additionalWriteFn = (_.isFunction(options.additionalWriteFn) ? options.additionalWriteFn : null) || this.additionalWriteFn;
        const disableMorganLogging = options.hasOwnProperty('disableMorganLogging') ? options.disableMorganLogging : this.disableMorganLogging;
        const morganFormat = options.morganFormat || this.morganFormat;
        const userGetFn = (_.isFunction(options.userGetFn) ? options.userGetFn : null) || this.userGetFn;
        return (req, res, next) => {
            this.#initializeMorgan();
            return morgan(morganFormat, {
                skip: () => disableMorganLogging,
                stream: {
                    write: (message) => {
                        if (additionalWriteFn) additionalWriteFn(req, res);
                        const logOptions = { };
                        const user = userGetFn ? userGetFn(req, res) : null;
                        if (user) logOptions.user = user;
                        ZeddemoreLogger.log(logOptions).http(this.#colorizeResponse(message.trim()));
                    },
                },
            })(req, res, next);
        }
    }

    requestLoggerMiddleware = (req, res, next) => {
        const requestValues = parseRequest(req);
        const requestId = this.#generateUuid();
        req[ this.requestIdAttribute ] = requestId;
        res.header(rqh.REQUEST_ID, requestId);
        const ipAddress = requestValues.ipAddress;
        res.locals = res.locals || { };
        res.locals.user = res.locals.user || { };
        res.locals.user.logger = this.createRequestLogger(requestId, ipAddress);
        return next();
    }

    #userGetFn(req, res) {
        return ((res && res.locals) ? res.locals.user : null)
            || ((req && req.locals) ? req.locals.user : null)
            || (req ? req.user : null);
    }

    userLoggerMiddleware = (req, res, next) => {
        const requestId = this.#getRequestId(req);
        const user = this.userGetFn(req, res) || { };
        if (!requestId) return next();
        const username = user.login || null;
        let ipAddress = user.ipAddress || null;
        if (!ipAddress) {
            const requestValues = parseRequest(req);
            ipAddress = requestValues.ipAddress;
        }
        let userLogLevel = !_.isNil(user.logLevel) ? user.logLevel : this.defaultUserLogLevel;
        if (userLogLevel < 0) userLogLevel = this.logLevel;
        const level = this.forceLogLevel ? this.logLevel : userLogLevel;
        res.locals = res.locals || { };
        res.locals.user = res.locals.user || user;
        res.locals.user.logger = this.createUserLogger(requestId, username, level, ipAddress);
        return next();
    }

    static writeAxiosErrorLog(axiosError, logOptions, options) {
        logOptions = logOptions || { };
        options = options || { };
        if (!axiosError || !axiosError.response) return;
        const _response = axiosError.response;
        if (!_response.request) return;
        const _request = _response.request;
        const logger = options.logger || ZeddemoreLogger.log(options);
        if (!logger) return;
        const _method = _request.method || null;
        const method = _method ? chalkHttpVerb(_method) : null;
        const _config = _response.config || null;
        const _headers = _response.headers || null;
        const _data = _response.data || null;
        const path = _config ? _config.url : '';
        const prefix = logOptions.prefix ? `[${ logOptions.prefix }]` : null;
        const status = chalkHttpStatus(_response.status);
        const _duration = axiosError.duration || _response.duration;
        const duration = _duration ? convertMilliseconds(_duration) : '-';
        let _contentLength = _headers ? _headers[ rsh.CONTENT_LENGTH ] : null;
        if (!_contentLength) _contentLength = _data ? sizeof(_data) : null;
        const contentLength = _contentLength ? `- ${ convertBytes(_contentLength) }` : null;
        const data = _data ? JSON.stringify(_data) : null;
        const parts = [ prefix, method, path, status, duration, contentLength, data ];
        const message = _.compact(parts).join(' ');
        logger.error(message);
    }

    static writeAxiosResponseLog(axiosResponse, logOptions, options) {
        logOptions = logOptions || { };
        options = options || { };
        if (!axiosResponse || !axiosResponse.request) return;
        const _request = axiosResponse.request;
        const axiosConfig = logOptions.axios || { };
        const configData = (logOptions.data && _.isObject(axiosConfig.data)) ? JSON.stringify(axiosConfig.data) : null;
        const logLevel = massageLogLevel(logOptions.logLevel);
        const logger = options.logger || ZeddemoreLogger.log(options);
        if (!logger) return;
        const _method = _request.method || null;
        const method = _method ? chalkHttpVerb(_method) : null;
        const _headers = axiosResponse.headers || null;
        const _data = axiosResponse.data || null;
        const path = _request.path || '';
        const prefix = logOptions.prefix ? `[${ logOptions.prefix }]` : null;
        const responseData = (logOptions.response && _.isObject(_data)) ? JSON.stringify(_data) : null;
        const status = chalkHttpStatus(axiosResponse.status);
        const _duration = axiosResponse.duration;
        const duration = _duration ? convertMilliseconds(_duration) : '-';
        let _contentLength = _headers ? _headers[ rsh.CONTENT_LENGTH ] : null;
        if (!_contentLength) _contentLength = _data ? sizeof(_data) : null;
        const contentLength = _contentLength ? `- ${ convertBytes(_contentLength) }` : null;
        const parts = [ prefix, method, path, configData, status, responseData, duration, contentLength ];
        const message = _.compact(parts).join(' ');
        logger[ logLevel ](message);
    }

}

module.exports = {
    log: ZeddemoreLogger.log,
    winstonLogLevelIdToName,
    writeAxiosErrorLog: ZeddemoreLogger.writeAxiosErrorLog,
    writeAxiosLog: ZeddemoreLogger.writeAxiosResponseLog, // deprecated
    writeAxiosResponseLog: ZeddemoreLogger.writeAxiosResponseLog,
    ZeddemoreLogger,
};
