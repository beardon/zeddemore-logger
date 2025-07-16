// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const chalk = require('chalk');
const { createLogger: createWinstonLogger, format, Logger, transports } = require('winston');
const morgan = require('morgan');
const sizeof = require('object-sizeof');
const { v4: uuid } = require('uuid');

const { areHeadersSent, isResponseSuccessful } = require('./response');
const { chalkHttpStatuses, chalkHttpVerbs, chalkLogLevel, chalkPackage, chalkTarget, stringToIdempotentHexColor } = require('./color');
const { convertBytes } = require('./math');
const { convertMilliseconds } = require('./date');
const enums = require('./enums');
const { extractToken, getRequestResponseTime, isRequestOfMethod, parseRequest } = require('./request');
const { logLevelMap } = require('./mappings/log_mappings');

const { colorize, combine, label, metadata, printf, timestamp } = format;
const { morganFormats: mf, morganFormatTokens: mft, httpMethods: http, httpRequestHeaders: rqh, httpResponseHeaders: rsh,
    winstonLogLevelNames: wlln, winstonLogLevels: wll } = enums;

const COLOR_CONSOLE_WHITE_HEX = '#ECECEC';
const DEFAULT_CONTENT_LENGTH_DIGITS = 2;
const DEFAULT_MORGAN_FORMAT_TOKENS = [ mft.METHOD, mft.DECODED_URL, mft.STATUS_COLORED, mft.RESPONSE_TIME_FORMAT, mft.CONTENT_LENGTH_FORMAT ];
const DEFAULT_REQUEST_ID_ATTRIBUTE = 'requestId';
const DEFAULT_RESPONSE_TIME_DIGITS = 0;
const DEFAULT_USER_LOG_LEVEL = -1;
const WINSTON_CONSOLE_TRANSPORT_NAME = 'console';

/**
 * Convert a log level to a Winston log level name
 * @param logLevel {number|string}
 * @returns {string}
 */
function massageLogLevel(logLevel) {
    if (!logLevel) return wlln.VERBOSE;
    if (!_.isInteger(logLevel)) return logLevel;
    return winstonLogLevelIdToName(logLevel);
}

/**
 * Monkey patch console to allow unlimited depth with `console.dirp`
 */
function monkeyPatchConsole() {
    console.dirp = (arguments) => console.dir(arguments, { depth: null });
}

/**
 * Convert a log level ID to a Winston log level name
 * @param levelId {number}
 * @returns {string}
 */
function winstonLogLevelIdToName(levelId) {
    const logLevelEntry =  _.find(logLevelMap, { winstonLevel: levelId });
    return logLevelEntry ? logLevelEntry.winstonName : wlln.HTTP;
}

class ZeddemoreLogger {

    #forceLogLevel = false;
    /** @type {Logger} */
    #logger = null;
    #logLevel = wll.INFO;
    #morganFormat = null;

    constructor(options) {
        options = options || { };
        this.apiCallModel = options.apiCallModel || null;
        this.apiRouteCategories = options.apiRouteCategories || [ ];
        this.apiRoutes = options.apiRoutes || [ ];
        this.apiVersion = options.apiVersion || null;
        this.contentLengthDigits = _.isInteger(options.contentLengthDigits) ? options.contentLengthDigits : DEFAULT_CONTENT_LENGTH_DIGITS;
        this.decodeUrls = _.isBoolean(options.decodeUrls) ? options.decodeUrls : true;
        this.defaultLabel = options.defaultLabel || 'zeddemore-logger';
        this.disableApiCallLogging = _.isBoolean(options.disableApiCallLogging) ? options.disableApiCallLogging : false;
        this.disableRouteLogging = _.isBoolean(options.disableRouteLogging) ? options.disableRouteLogging : false;
        this.disableMorganLogging = _.isBoolean(options.disableMorganLogging) ? options.disableMorganLogging : false;
        this.displayCaller = _.isBoolean(options.displayCaller) ? options.displayCaller : true;
        this.displayIpAddress = _.isBoolean(options.displayIpAddress) ? options.displayIpAddress : true;
        this.displayRequestId = _.isBoolean(options.displayRequestId) ? options.displayRequestId : true;
        this.customCallerSettings = options.customCallerSettings || [ ];
        this.defaultUserLogLevel = options.defaultUserLogLevel || DEFAULT_USER_LOG_LEVEL;
        this.#forceLogLevel = _.isBoolean(options.forceLogLevel) ? options.forceLogLevel : false;
        this.#logLevel = _.isInteger(options.logLevel) ? options.logLevel : wll.INFO;
        this.morganFormat = _.isString(options.morganFormat) ? options.morganFormat : null;
        this.responseTimeDigits = _.isInteger(options.responseTimeDigits) ? options.responseTimeDigits : DEFAULT_RESPONSE_TIME_DIGITS;
        this.routeModel = options.routeModel || null;
        this.suppressNonMutatingRequestApiCallLogging = _.isBoolean(options.suppressNonMutatingRequestApiCallLogging) ? options.suppressNonMutatingRequestApiCallLogging : false;
        this.suppressSuccessfulRequestApiCallLogging = _.isBoolean(options.suppressSuccessfulRequestApiCallLogging) ? options.suppressSuccessfulRequestApiCallLogging : false;
        this.timestampFormat = options.timestampFormat || 'YYYY-MM-DD HH:mm:ss';
        this.requestIdAttribute = options.requestIdAttribute || DEFAULT_REQUEST_ID_ATTRIBUTE;
        this.userGetFn = options.userGetFn || this.#userGetFn;
    }

    get apiCallLoggingEnabled() {
        return !this.disableApiCallLogging && !!this.apiCallModel;
    }

    get morganFormat() {
        if (!!this.#morganFormat) return this.#morganFormat;
        return mf.ZEDDEMORE;
    }

    set morganFormat(format) {
        if (_.isString(format) && !!format.length) this.#morganFormat = format;
    }

    get forceLogLevel() {
        return this.#forceLogLevel;
    }

    get logger() {
        if (!this.#logger) this.#logger = this.createLogger();
        return this.#logger;
    }

    get logLevel() {
        return this.#logLevel;
    }

    get logLevelName() {
        return winstonLogLevelIdToName(this.#logLevel);
    }

    get routeLoggingEnabled() {
        return !this.disableRouteLogging && !!this.routeModel;
    }

    set forceLogLevel(doForce) {
        this.#forceLogLevel = !!doForce;
    }

    set logLevel(level) {
        this.#logLevel = massageLogLevel(level);
    }

    #buildMorganFormat = (morganTokens = [ ]) => {
        function addArgument(token, argument) {
            if (hasArgument(token)) return token;
            const openBracketIndex = token.indexOf('[');
            const _token = (openBracketIndex > -1) ? token.substring(0, openBracketIndex) : token;
            return `${ _token }[${ argument }]`;
        }
        function hasArgument(token) {
            const openBracketIndex = token.indexOf('[');
            const closeBracketIndex = token.indexOf(']');
            return ((openBracketIndex > -1) && (closeBracketIndex > -1) && (closeBracketIndex > (openBracketIndex + 1)));
        }
        if (!morganTokens || !_.isArray(morganTokens) || !morganTokens.length) return mf.DEV;
        const _morganTokens = _.map(morganTokens, (token) => {
            if (!_.isString(token) || !token.length) return null;
            let _token = token.trim();
            if (_token[ 0 ] !== ':') _token = `:${ _token }`;
            switch (_token) {
                case mft.CONTENT_LENGTH_FORMAT: return hasArgument(_token) ? _token : addArgument(_token, this.contentLengthDigits);
                case mft.RESPONSE_TIME:
                case mft.RESPONSE_TIME_FORMAT: return hasArgument(_token) ? _token : addArgument(_token, this.responseTimeDigits);
                default: return _token;
            }
        });
        return (_.compact(_morganTokens)).join(' ');
    }

    #buildWinstonFormat = (options, additionalFormats = [ ]) => {
        options = options || { };
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

    #buildWinstonTransport = (logLevel = this.#logLevel) => {
        logLevel = logLevel || this.#logLevel;
        const level = winstonLogLevelIdToName(logLevel);
        return new transports.Console({ level, name: WINSTON_CONSOLE_TRANSPORT_NAME });
    }

    #buildWinstonTransports = (logLevel = this.#logLevel, additionalTransports = [ ]) => {
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
        return chalkHttpVerbs(verb, message);
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

    enableConsoleDirp() {
        monkeyPatchConsole();
    }

    #generateUuid() {
        return uuid(null, null, null);
    }

    static getLogger(options) {
        options = options || { };
        const logger = options.logger || (options.user ? options.user.logger : null) || ((app && app.locals) ? app.locals.logger : null);
        if (logger) return logger;
        const zeddemoreLogger = new ZeddemoreLogger();
        return zeddemoreLogger.createLogger(options);
    }

    #getRequestId = (req) => {
        if (!req) return null;
        return req[ this.requestIdAttribute ];
    }

    #initializeMorgan() {
        function buildContentLengthFormatToken(res, decimals = DEFAULT_CONTENT_LENGTH_DIGITS) {
            const contentLength = convertBytes(res.get('content-length'), { decimals });
            return contentLength ? ` - ${ contentLength }` : '';
        }
        function buildDecodedUrl(req) {
            const url = req.originalUrl || req.url;
            return decodeURI(url);
        }
        function buildResponseTimeFormatToken(req, res, digits = DEFAULT_RESPONSE_TIME_DIGITS) {
            const responseTime = getRequestResponseTime(req, res);
            return responseTime ? convertMilliseconds(responseTime, { digits }) : '-';
        }
        function buildStatusColoredToken(res) {
            const statusCode = areHeadersSent(res) ? res.statusCode : null;
            if (!statusCode) return '-';
            return chalkHttpStatuses(statusCode);
        }
        morgan.token(mft.CONTENT_LENGTH_FORMAT, (req, res, decimals) => { return buildContentLengthFormatToken(res, decimals); });
        morgan.token(mft.DECODED_URL, (req, res) => { return buildDecodedUrl(req); });
        morgan.token(mft.RESPONSE_TIME_FORMAT, (req, res, digits) => { return buildResponseTimeFormatToken(req, res, digits); });
        morgan.token(mft.STATUS_COLORED, (req, res) => { return buildStatusColoredToken(res); });
        morgan.format(mf.ZEDDEMORE, this.#buildMorganFormat(DEFAULT_MORGAN_FORMAT_TOKENS));
    }

    log = (logLevel) => {
        logLevel = logLevel || this.#logLevel;
        const logLevelName = massageLogLevel(logLevel);
        return this.logger[ logLevelName ];
    }

    #logServerInfo = (options, logLevel = wll.INFO) => {
        options = options || { };
        const showLogLevel = _.isBoolean(options.showLogLevel) ? options.showLogLevel : true;
        const logLevelLabel = chalkLogLevel(this.#logLevel, this.logLevelName.toUpperCase());
        const msgParts = [ `Server is ${ chalk.bold(chalk.yellowBright('⚡live⚡')) }` ];
        if (showLogLevel) msgParts.push(`with log level ${ logLevelLabel }${ this.#forceLogLevel ? ` (${ chalk.italic('forced') })` : '' }`);
        if (options.url) msgParts.push(`at ${ chalk.underline(options.url) }`);
        this.log(logLevel)(msgParts.join(' '));
    }

    #logServerListening = (options, logLevel = wll.INFO) => {
        const serverEnvironment = options.environment || process.env.NODE_ENV || 'development';
        const serverInstance = options.instance || (process.env.NODE_APP_INSTANCE && (process.env.NODE_APP_INSTANCE.length > 1)) ? process.env.NODE_APP_INSTANCE : null; // handles goofy PM2 NODE_APP_INSTANCE of '0'
        const serverName = options.name || this.defaultLabel;
        const serverPort = options.port || process.env.PORT || 3000;
        const msgParts = [ ];
        const serverParts = [ serverName ];
        if (serverEnvironment) serverParts.push(serverEnvironment);
        if (serverInstance) serverParts.push(serverInstance);
        msgParts.push(`[${ serverParts.join(':') }]`);
        msgParts.push(`Node.js Express server listening on port ${ chalk.bold(serverPort) }`);
        this.log(logLevel)(msgParts.join(' '));
    }

    #logServerPackagesInfo = (options, packages, logLevel = wll.INFO) => {
        function buildVersionLabel(_package) {
            if (!_package || !_package.name || !_package.version) return null;
            const packageName = _package.style ? chalkTarget(_package.name, _package.style) : chalkPackage(_package.name);
            return `${ packageName }@${ _package.version }`;
        }
        const versionParts = _.compact(_.sortBy(packages, (_package) => _package.name.toUpperCase()).map(buildVersionLabel));
        this.log(logLevel)(`Packages: ${ versionParts.join(' | ') }`);
    }

    #logServerRoutesAdded = (options, logLevel = wll.INFO) => {
        options = options || { };
        const showCategories = _.isBoolean(options.showCategories) ? options.showCategories : true;
        const routes = options.routes || this.apiRoutes || [ ];
        const routesLabel = (routes.length === 1) ? 'route' : 'routes';
        const addedLabel = chalk.green('added');
        const msgParts = [ `${ routes.length } ${ routesLabel } ${ addedLabel }` ];
        if (showCategories) {
            const categories = options.categories || this.apiRouteCategories || [];
            msgParts.push(`in: ${ categories.sort().join('/') }`);
        }
        this.log(logLevel)(msgParts.join(', '));
    }

    logServerStartup = (options, logLevel = wll.INFO) => {
        options = options || { };
        const showListening = _.isBoolean(options.showListening) ? options.showListening : true;
        const showPackages = _.isBoolean(options.showPackages) ? options.showPackages : true;
        const showRoutes = _.isBoolean(options.showRoutes) ? options.showRoutes : true;
        const showInfo = _.isBoolean(options.showInfo) ? options.showInfo : true;
        if (showListening) this.#logServerListening(options, logLevel);
        if (showPackages && options.packages) this.#logServerPackagesInfo(options, options.packages, logLevel);
        if (showRoutes) this.#logServerRoutesAdded(options, logLevel);
        if (showInfo) this.#logServerInfo(options, logLevel);
    }

    #matchPathToRoute = (path) => {
        if (!path) return null;
        let matchedRoute = null;
        for (const route of this.apiRoutes) {
            if (path.match(route.regexp)) {
                matchedRoute = route.path;
                break;
            }
        }
        return matchedRoute;
    }

    morganMiddleware = (options) => {
        options = options || { };
        const disableMorganLogging = _.isBoolean(options.disableMorganLogging) ? options.disableMorganLogging : this.disableMorganLogging;
        const morganFormat = options.morganFormat || this.#buildMorganFormat(DEFAULT_MORGAN_FORMAT_TOKENS);
        const userGetFn = (_.isFunction(options.userGetFn) ? options.userGetFn : null) || this.userGetFn;
        return (req, res, next) => {
            this.#initializeMorgan();
            return morgan(morganFormat, {
                skip: () => disableMorganLogging,
                stream: {
                    write: (message) => {
                        if (this.apiCallLoggingEnabled) this.#writeApiCallToDatabase(req, res, options);
                        const logOptions = { };
                        const user = userGetFn ? userGetFn(req, res) : null;
                        if (user) logOptions.user = user;
                        ZeddemoreLogger.getLogger(logOptions).http(this.#colorizeResponse(message.trim()));
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

    routeLoggingMiddleware = (req, res, next) => {
        if (!this.routeLoggingEnabled) return next();
        try {
            const routeValues = {
                route: req.path,
                method: req.method,
                lastCalled: new Date().toISOString(),
            };
            this.#writeRouteToDatabase(routeValues);
        } catch (e) {
        } finally {
            next();
        }
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
        const username = user.login || user.username || null;
        let ipAddress = user.ipAddress || null;
        if (!ipAddress) {
            const requestValues = parseRequest(req);
            ipAddress = requestValues.ipAddress;
        }
        let userLogLevel = !_.isNil(user.logLevel) ? user.logLevel : this.defaultUserLogLevel;
        if (userLogLevel < 0) userLogLevel = this.#logLevel;
        const level = this.#forceLogLevel ? this.#logLevel : userLogLevel;
        res.locals = res.locals || { };
        res.locals.user = res.locals.user || user;
        res.locals.user.logger = this.createUserLogger(requestId, username, level, ipAddress);
        return next();
    }

    #writeApiCallToDatabase = async (req, res, options) => {
        options = options || { };
        if (!req) return;
        const user = this.userGetFn ? this.userGetFn(req, res) : null;
        const statusCode = options.statusCode || (res ? res.statusCode : null);
        if (isResponseSuccessful(statusCode) && this.suppressSuccessfulRequestApiCallLogging) return;
        if (!isRequestOfMethod(req, [ http.DELETE, http.PUT ]) && this.suppressNonMutatingRequestApiCallLogging) return;
        const matchedRoute = this.#matchPathToRoute(req.path);
        let metadataDefaults = Object.assign({ }, user);
        delete(metadataDefaults.id);
        delete(metadataDefaults.logger);
        const _metadata = _.defaults({ }, (options.metadata || { }), metadataDefaults);
        if (matchedRoute) {
            try {
                const appCallValues = {
                    apiVersion: this.apiVersion,
                    client: user ? user.clientId : null,
                    clientVersion: req.header(rqh.APP_VERSION),
                    httpStatusCode: statusCode,
                    ipAddress: req.header(rqh.FORWARDED_FOR) || req.socket.remoteAddress,
                    metadata: _metadata,
                    method: req.method,
                    route: matchedRoute,
                    token: extractToken(req),
                    userAgent: req.header(rqh.USER_AGENT),
                    userId: user ? user.id : null,
                };
                await this.apiCallModel.create(appCallValues);
            } catch (e) {
                console.error(e);
                ZeddemoreLogger.getLogger({ user }).error('Api call logging failed, moving on');
            }
        }
    }

    #writeRouteToDatabase = async (routeValues) => {
        if (!this.routeLoggingEnabled || !routeValues) return;
        const matchedRoute = this.#matchPathToRoute(routeValues.route);
        if (matchedRoute) {
            try {
                const route = await this.routeModel.findOne({ where: { route: matchedRoute }, logging: false });
                if (route) {
                    route.count++;
                    route.lastCalledAt = new Date();
                    route.save();
                } else {
                    this.routeModel.create({
                        count: 1,
                        lastCalledAt: new Date(),
                        method: routeValues.method,
                        route: matchedRoute,
                    });
                }
            } catch (e) {
                console.error(e);
                console.error('Route logging failed, moving on');
            }
        }
    }

    static writeAxiosErrorLog(axiosError, logOptions, options) {
        logOptions = logOptions || { };
        options = options || { };
        if (!axiosError || !axiosError.response) return;
        const _response = axiosError.response;
        if (!_response.request) return;
        const _request = _response.request;
        const logger = options.logger || ZeddemoreLogger.getLogger(options);
        if (!logger) return;
        const _method = _request.method || null;
        const method = _method ? chalkHttpVerbs(_method) : null;
        const _config = _response.config || null;
        const _headers = _response.headers || null;
        const _data = _response.data || null;
        const path = _config ? _config.url : '';
        const prefix = logOptions.prefix ? `[${ logOptions.prefix }]` : null;
        const status = chalkHttpStatuses(_response.status);
        const _duration = axiosError.duration || _response.duration;
        const duration = _duration ? convertMilliseconds(_duration, logger.responseTimeDigits) : '-';
        let _contentLength = _headers ? _headers[ rsh.CONTENT_LENGTH ] : null;
        if (!_contentLength) _contentLength = _data ? sizeof(_data) : null;
        const contentLength = _contentLength ? `- ${ convertBytes(_contentLength, logger.contentLengthDigits) }` : null;
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
        const logger = options.logger || ZeddemoreLogger.getLogger(options);
        if (!logger) return;
        const _method = _request.method || null;
        const method = _method ? chalkHttpVerbs(_method) : null;
        const _headers = axiosResponse.headers || null;
        const _data = axiosResponse.data || null;
        const path = _request.path || '';
        const prefix = logOptions.prefix ? `[${ logOptions.prefix }]` : null;
        const responseData = (logOptions.response && _.isObject(_data)) ? JSON.stringify(_data) : null;
        const status = chalkHttpStatuses(axiosResponse.status);
        const _duration = axiosResponse.duration;
        const duration = _duration ? convertMilliseconds(_duration, logger.responseTimeDigits) : '-';
        let _contentLength = _headers ? _headers[ rsh.CONTENT_LENGTH ] : null;
        if (!_contentLength) _contentLength = _data ? sizeof(_data) : null;
        const contentLength = _contentLength ? `- ${ convertBytes(_contentLength, logger.contentLengthDigits) }` : null;
        const parts = [ prefix, method, path, configData, status, responseData, duration, contentLength ];
        const message = _.compact(parts).join(' ');
        logger[ logLevel ](message);
    }

}

module.exports = {
    log: ZeddemoreLogger.getLogger,
    winstonLogLevelIdToName,
    writeAxiosErrorLog: ZeddemoreLogger.writeAxiosErrorLog,
    writeAxiosLog: ZeddemoreLogger.writeAxiosResponseLog, // deprecated
    writeAxiosResponseLog: ZeddemoreLogger.writeAxiosResponseLog,
    ZeddemoreLogger,
};
