// Copyright (c) 2025-2026 by Beardon Services, Inc.

const _ = require('lodash');
const chalk = require('chalk');
const { hostname } = require('node:os');
const morgan = require('morgan');
const sizeof = require('object-sizeof');
const winston = require('winston');

const { areHeadersSent, isResponseFailure, isResponseSuccessful } = require('./response');
const { chalkHttpStatuses, chalkHttpVerbs, chalkLogLevel, chalkPackage, chalkTarget } = require('./color');
const { convertBytes } = require('./math');
const { convertMilliseconds } = require('./date');
const defaults = require('./defaults');
const enums = require('./enums');
const { extractHttpStatusCode, extractHttpVerb } = require('./http');
const { extractToken, getRequestResponseTime, isRequestOfMethod, parseRequest } = require('./request');
const { generateUuid } = require('./uuid');
const { isMorganFormat, isWinstonFormat, isWinstonLogLevelId, isWinstonTransport, monkeyPatchConsole, transportLogLevelType,
    winstonLogLevelName } = require('./logging');
require('./typedef');
const WinstonEmailTransport = require('./transports/WinstonEmailTransport');
const ZeddemoreBase = require('./ZeddemoreBase');
const ZeddemoreLoggerController = require('./ZeddemoreLoggerController');

const { createLogger: createWinstonLogger, format: winstonFormat, Logform: Format, transports } = winston;
const { httpMethods: http, httpRequestHeaders: rqh, httpResponseHeaders: rsh, logLevelTypes: llt, morganFormats: mf,
    morganFormatTokens: mft, winstonFormats: wf, winstonLogLevelNames: wlln, winstonLogLevels: wll, winstonTransports: wt } = enums;

class ZeddemoreLogger extends ZeddemoreBase {

    #apiCallSequelizeLogging = false;
    /** @type {SequelizeModel} */
    #apiCallSequelizeModel = null;
    #apiRouteCategories = [ ];
    #apiRoutes = [ ];
    #apiVersion = null;
    #decodeUrls = true;
    #doConsoleLog = true;
    #doEmailLog = false;
    #emailLogDebug = false;
    #emailLogFrom = null;
    #emailLogHost = null;
    #emailLogLevel = wll.ERROR;
    #emailLogPassword = null;
    #emailLogPort = null;
    #emailLogSubject = 'Zeddemore Log ({{ level }}) - {{ message }}';
    #emailLogTo = null;
    #emailLogUseHtml = false;
    #emailLogUsername = null;
    #httpRequestLogging = true;
    /** @type {ZeddemoreLoggerController} */
    #logger = null;
    #morganFormat = mf.ZEDDEMORE;
    #routeSequelizeLogging = false;
    /** @type {SequelizeModel} */
    #routeSequelizeModel = null;
    #serverUrl = null;
    #suppressNonMutatingRequestApiCallLogging = false;
    #suppressSuccessfulRequestApiCallLogging = false;

    constructor(options) {
        options = options || { };
        super(options);
        this.apiCallSequelizeLogging = options.apiCallSequelizeLogging;
        if (_.isBoolean(options.disableApiCallLogging)) this.apiCallSequelizeLogging = !options.disableApiCallLogging; // backwards compatibility
        this.apiCallSequelizeModel = options.apiCallSequelizeModel;
        if (this.#isSequelizeModel(options.apiCallModel)) this.apiCallSequelizeModel = options.apiCallModel; // backwards compatibility
        this.apiRouteCategories = options.apiRouteCategories;
        this.apiRoutes = options.apiRoutes;
        this.apiVersion = options.apiVersion;
        this.decodeUrls = options.decodeUrls;
        this.doConsoleLog = options.doConsoleLog;
        this.doEmailLog = options.doEmailLog;
        this.emailLogDebug = options.emailLogDebug;
        this.emailLogFrom = options.emailLogFrom;
        this.emailLogHost = options.emailLogHost;
        this.emailLogLevel = options.emailLogLevel;
        this.emailLogPassword = options.emailLogPassword;
        this.emailLogPort = options.emailLogPort;
        this.emailLogSubject = options.emailLogSubject;
        this.emailLogTo = options.emailLogTo;
        this.emailLogUseHtml = options.emailLogUseHtml;
        this.emailLogUsername = options.emailLogUsername;
        this.httpRequestLogging = options.httpRequestLogging;
        if (_.isBoolean(options.disableMorganLogging )) this.httpRequestLogging = !options.disableMorganLogging; // backwards compatibility
        this.morganFormat = options.morganFormat;
        this.routeSequelizeLogging = options.routeSequelizeLogging;
        if (_.isBoolean(options.disableRouteLogging)) this.routeSequelizeLogging = !options.disableRouteLogging; // backwards compatibility
        this.routeSequelizeModel = options.routeSequelizeModel;
        if (this.#isSequelizeModel(options.routeModel)) this.routeSequelizeModel = options.routeModel; // backwards compatibility
        this.serverUrl = options.serverUrl;
        this.suppressNonMutatingRequestApiCallLogging = options.suppressNonMutatingRequestApiCallLogging;
        this.suppressSuccessfulRequestApiCallLogging = options.suppressSuccessfulRequestApiCallLogging;
    }

    get apiCallSequelizeLogging() {
        return this.#apiCallSequelizeLogging;
    }

    set apiCallSequelizeLogging(enabled) {
        if (_.isBoolean(enabled)) this.#apiCallSequelizeLogging = enabled;
    }

    get apiCallSequelizeModel() {
        return this.#apiCallSequelizeModel;
    }

    set apiCallSequelizeModel(model) {
        if (this.#isSequelizeModel(model)) this.#apiCallSequelizeModel = model;
    }

    get apiRouteCategories() {
        return this.#apiRouteCategories;
    }

    set apiRouteCategories(categories) {
        if (_.isArray(categories)) this.#apiRouteCategories = categories;
    }

    get apiRoutes() {
        return this.#apiRoutes;
    }

    set apiRoutes(routes) {
        if (_.isArray(routes)) this.#apiRoutes = routes;
    }

    get apiVersion() {
        return this.#apiVersion;
    }

    set apiVersion(version) {
        if (_.isString(version) && !!version.length) this.#apiVersion = version;
    }

    get canEmailLog() {
        return this.doEmailLog && !!this.emailLogFrom && !!this.emailLogHost && !!this.emailLogPort && !!this.emailLogTo;
    }

    get canSequelizeLogApiCall() {
        return this.apiCallSequelizeLogging && !!this.apiCallSequelizeModel;
    }

    get canSequelizeLogRoute() {
        return this.routeSequelizeLogging && !!this.routeSequelizeModel;
    }

    get decodeUrls() {
        return this.#decodeUrls;
    }

    set decodeUrls(doDecode) {
        if (_.isBoolean(doDecode)) this.#decodeUrls = doDecode;
    }

    get doConsoleLog() {
        return this.#doConsoleLog;
    }

    set doConsoleLog(doLog) {
        if (_.isBoolean(doLog)) this.#doConsoleLog = doLog;
    }

    get doEmailLog() {
        return this.#doEmailLog;
    }

    set doEmailLog(doLog) {
        if (_.isBoolean(doLog)) this.#doEmailLog = doLog;
    }

    get emailLogDebug() {
        return this.#emailLogDebug;
    }

    set emailLogDebug(debug) {
        if (_.isBoolean(debug)) this.#emailLogDebug = debug;
    }

    get emailLogFrom() {
        return this.#emailLogFrom || this.#buildEmailLogFrom();
    }

    set emailLogFrom(from) {
        if (_.isString(from) && !!from.length) this.#emailLogFrom = from;
    }

    get emailLogHost() {
        return this.#emailLogHost;
    }

    set emailLogHost(host) {
        if (_.isString(host) && !!host.length) this.#emailLogHost = host;
    }

    get emailLogLevel() {
        return this.#emailLogLevel;
    }

    set emailLogLevel(level) {
        if (isWinstonLogLevelId(level)) this.#emailLogLevel = level;
    }

    get emailLogPassword() {
        return this.#emailLogPassword;
    }

    set emailLogPassword(password) {
        if (_.isString(password) && !!password.length) this.#emailLogPassword = password;
    }

    get emailLogPort() {
        return this.#emailLogPort;
    }

    set emailLogPort(port) {
        if (_.isInteger(port)) this.#emailLogPort = port;
    }

    get emailLogSubject() {
        return this.#emailLogSubject;
    }

    set emailLogSubject(subject) {
        if (_.isString(subject) && !!subject.length) this.#emailLogSubject = subject;
    }

    get emailLogTo() {
        return this.#emailLogTo;
    }

    set emailLogTo(to) {
        if (_.isString(to) && !!to.length) this.#emailLogTo = to;
    }

    get emailLogUseHtml() {
        return this.#emailLogUseHtml;
    }

    set emailLogUseHtml(useHtml) {
        if (_.isBoolean(useHtml)) this.#emailLogUseHtml = useHtml;
    }

    get emailLogUsername() {
        return this.#emailLogUsername;
    }

    set emailLogUsername(username) {
        if (_.isString(username) && !!username.length) this.#emailLogUsername = username;
    }

    get httpRequestLogging() {
        return this.#httpRequestLogging;
    }

    set httpRequestLogging(enabled) {
        if (_.isBoolean(enabled)) this.#httpRequestLogging = enabled;
    }

    get logger() {
        if (!(this.#logger instanceof ZeddemoreLoggerController)) this.#logger = this.createLoggerController();
        return this.#logger;
    }

    get morganFormat() {
        return this.#morganFormat;
    }

    set morganFormat(format) {
        if (isMorganFormat(format)) this.#morganFormat = format;
    }

    get routeSequelizeLogging() {
        return this.#routeSequelizeLogging;
    }

    set routeSequelizeLogging(enabled) {
        if (_.isBoolean(enabled)) this.#routeSequelizeLogging = enabled;
    }

    get routeSequelizeModel() {
        return this.#routeSequelizeModel;
    }

    set routeSequelizeModel(model) {
        if (this.#isSequelizeModel(model)) this.#routeSequelizeModel = model;
    }

    get serverEnvironment() {
        return process.env.NODE_ENV || 'development';
    }

    get serverInstance() {
        return (process.env.NODE_APP_INSTANCE && (process.env.NODE_APP_INSTANCE.length > 1)) ? process.env.NODE_APP_INSTANCE : null; // handles goofy PM2 NODE_APP_INSTANCE of '0'
    }

    get serverName() {
        return this.defaultLabel;
    }

    get serverPort() {
        return process.env.PORT || 3000;
    }

    get serverUrl() {
        return this.#serverUrl || hostname();
    }

    set serverUrl(url) {
        if (_.isString(url) && !!url.length) this.#serverUrl = url;
    }

    get suppressNonMutatingRequestApiCallLogging() {
        return this.#suppressNonMutatingRequestApiCallLogging;
    }

    set suppressNonMutatingRequestApiCallLogging(suppress) {
        if (_.isBoolean(suppress)) this.#suppressNonMutatingRequestApiCallLogging = suppress;
    }

    get suppressSuccessfulRequestApiCallLogging() {
        return this.#suppressSuccessfulRequestApiCallLogging;
    }

    set suppressSuccessfulRequestApiCallLogging(suppress) {
        if (_.isBoolean(suppress)) this.#suppressSuccessfulRequestApiCallLogging = suppress;
    }

    get values() {
        return {
            ...super.values,
            apiCallSequelizeLogging: this.apiCallSequelizeLogging,
            apiCallSequelizeModel: this.apiCallSequelizeModel,
            apiRouteCategories: this.apiRouteCategories,
            apiRoutes: this.routeSequelizeLogging,
            apiVersion: this.apiVersion,
            decodeUrls: this.decodeUrls,
            doConsoleLog: this.doConsoleLog,
            doEmailLog: this.doEmailLog,
            emailLogDebug: this.emailLogDebug,
            emailLogFrom: this.emailLogFrom,
            emailLogHost: this.emailLogHost,
            emailLogLevel: this.emailLogLevel,
            emailLogPort: this.emailLogPort,
            emailLogSubject: this.emailLogSubject,
            emailLogTo: this.emailLogTo,
            emailLogUseHtml: this.emailLogUseHtml,
            httpRequestLogging: this.httpRequestLogging,
            logger: this.logger,
            morganFormat: this.morganFormat,
            routeSequelizeLogging: this.routeSequelizeLogging,
            routeSequelizeModel: this.routeSequelizeModel,
            serverUrl: this.serverUrl,
            suppressNonMutatingRequestApiCallLogging: this.suppressNonMutatingRequestApiCallLogging,
            suppressSuccessfulRequestApiCallLogging: this.suppressSuccessfulRequestApiCallLogging,
        };
    }

    #buildEmailLogFrom() {
        if (_.isString(this.#emailLogFrom) && !!this.#emailLogFrom) return this.#emailLogFrom;
        const localParts = [ 'zeddemore' ]
        if (!!this.serverName) localParts.push(this.serverName);
        if (!!this.serverInstance) localParts.push(this.serverInstance);
        if (!!this.serverEnvironment) localParts.push(this.serverEnvironment);
        return `${ localParts.join('_') }@${ hostname() }`;
    }

    /**
     * Build log message
     * @param {String|[String]|Object} [message]
     * @param {String} [level]
     * @param {String} [error]
     * @param {Metadata} [metadata]
     * @param {Boolean} [colorize]
     * @returns {string}
     */
    #buildLogMessage = (message, level, error, metadata, colorize = this.colorize) => {
        metadata = this._structureMetadata(metadata);
        const isError = !!level && (level.indexOf(wlln.ERROR) > -1);
        const leaveUncompressed = isError || !!metadata.raw;
        const parts = [ this._buildLogMessagePrefix(level, metadata, colorize) ];
        let msg = Array.isArray(message) ? message.join('\n') : message;
        msg = _.isObject(message) ? JSON.stringify(msg) : msg;
        parts.push(leaveUncompressed ? msg : msg.replace(/(\n?\s+)/g, ' '));
        if (!!error) parts.push(error);
        const logMessage = parts.join(' ').trim();
        return (isError && colorize) ? chalk.red(logMessage) : logMessage;
    }

    /**
     * Build a Morgan format
     * @param {[String]} morganTokens
     * @returns {string}
     */
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

    /**
     * Build a Winston format
     * @param {Object} options
     * @param {[Format|String]} [additionalFormats]
     * @returns {Format}
     */
    #buildWinstonFormat = (options, additionalFormats = [ ]) => {
        additionalFormats = _.isArray(additionalFormats) ? additionalFormats : [ additionalFormats ];
        const formats = this.#getDefaultFormats(options);
        const _additionalFormats = _.compact(additionalFormats.map((format) => {
            if (isWinstonFormat(format)) return this.#getBuiltinFormat(format, options);
            if (_.isFunction(format)) return format;
            return null;
        }));
        return winstonFormat.combine(..._additionalFormats.concat(formats));
    }

    /**
     * Build Winston log template
     * @param {Object} info
     * @param {String} [info.err]
     * @param {String} [info.level]
     * @param {String|[String]|Object} [info.message]
     * @param {Object} [info.metadata]
     * @param {Boolean} [colorize]
     * @returns {string}
     */
    #buildWinstonTemplate = (info, colorize = this.colorize) => {
        info = info || { };
        return this.#buildLogMessage(info.message, info.level, info.err, info.metadata, colorize);
    }

    /**
     * Build a Winston Console transport
     * @param {number|String} [logLevel]
     * @returns {winston.ConsoleTransportInstance}
     */
    #buildWinstonConsoleTransport = (logLevel = this.logLevel) => {
        logLevel = logLevel || this.logLevel;
        const level = winstonLogLevelName(logLevel);
        return new transports.Console({ id: wt.CONSOLE, level });
    }

    /**
     * Build a Winston Email transport
     * @param {number|String} [logLevel]
     * @returns {WinstonEmailTransport}
     */
    #buildWinstonEmailTransport = (logLevel = this.emailLogLevel) => {
        logLevel = logLevel || this.emailLogLevel;
        const level = winstonLogLevelName(logLevel);
        const messageOptions = {
            from: this.emailLogFrom,
            subject: this.emailLogSubject,
            to: this.emailLogTo,
        };
        const transportOptions = {
            auth: {
                user: this.emailLogUsername,
                pass: this.emailLogPassword,
            },
            debug: this.emailLogDebug,
            host: this.emailLogHost,
            port: this.emailLogPort,
        };
        const winstonOptions = { level };
        const _options = { id: wt.EMAIL, messageOptions, transportOptions, ...winstonOptions };
        return new WinstonEmailTransport(_options);
    }

    /**
     * Build Winston transports
     * @param {[Object|String]} [transports]
     * @returns {Object[]}
     */
    #buildWinstonTransports = (transports = [ ]) => {
        transports = _.compact(_.isArray(transports) ? transports : [ transports ]);
        return _.compact(transports.map((transport) => {
            if (isWinstonTransport(transport)) return this.#getBuiltinTransport(transport);
            if (_.isObject(transport)) return transport;
            return null;
        }));
    }

    #colorizeResponse(message) {
        const verb = extractHttpVerb(message);
        return verb ? chalkHttpVerbs(verb, message) : message;
    }

    createLogger = (options) => {
        return this.createLoggerController(options);
    }

    /**
     * Create a ZeddemoreLoggerController
     * @param {Object} [options]
     * @param {[Format|String]} [options.formats]
     * @param {[Object|String]} [options.transports]
     * @returns {ZeddemoreLoggerController}
     */
    #createLoggerController = (options) => {
        options = options || { };
        const transports = _.compact(_.isArray(options.winstonTransports) ? options.winstonTransports : [ options.winstonTransports ]);
        const defaultLoggerTransports = transports.concat(this.#getDefaultTransports());
        const defaultLogger = this.#createWinstonLogger({ transports: defaultLoggerTransports, ...options });
        const emailLogger = this.#createWinstonLogger({ transports: [ wt.EMAIL ], ...options });
        return new ZeddemoreLoggerController({ logger: defaultLogger, emailLogger });
    }

    createLoggerController = (options) => {
        this.#logger = this.#createLoggerController(options);
        return this.#logger;
    }

    /**
     * Create a Winston logger with request information
     * @param {String} [requestId]
     * @param {String} [ipAddress]
     * @returns {ZeddemoreLoggerController}
     */
    createRequestLogger = (requestId = null, ipAddress = null) => {
        requestId = requestId || generateUuid();
        /** @type {Object} */
        const loggerOptions = { id: requestId };
        if (ipAddress) loggerOptions.ip = ipAddress;
        return this.createLoggerController(loggerOptions);
    }

    /**
     * Create a Winston logger with user information
     * @param {String} [requestId]
     * @param {String} [username]
     * @param {number|String} [logLevel]
     * @param {String} [ipAddress]
     * @returns {ZeddemoreLoggerController}
     */
    createUserLogger = (requestId = null, username = null, logLevel = this.defaultUserLogLevel, ipAddress = null) => {
        requestId = requestId || generateUuid();
        logLevel = logLevel || this.defaultUserLogLevel;
        const loggerOptions = { id: requestId, level: logLevel, user: username };
        if (ipAddress) loggerOptions.ip = ipAddress;
        return this.createLoggerController(loggerOptions);
    }

    /**
     * Create a Winston Logger
     * @param {Object} [options]
     * @param {[Format|string]} [options.formats]
     * @param {[Object|String]} [options.transports]
     * @returns {winston.Logger}
     */
    #createWinstonLogger = (options) => {
        options = options || { };
        const format = this.#buildWinstonFormat(options, options.formats);
        const transports = this.#buildWinstonTransports(options.transports);
        return createWinstonLogger({ format, transports });
    }

    /**
     * Enable console.dir extension
     * @deprecated
     */
    enableConsoleDirp(...args) {
        return this.enableConsoleDirExtension(...args);
    }

    /**
     * Enable console.dir extension
     * @param {[string]} [methodNames]
     * @param {Boolean} [colors]
     * @param {number|null} [depth]
     * @param {Boolean} [showHidden]
     * @returns {void}
     */
    enableConsoleDirExtension(methodNames = [ defaults.consoleDirExtensionMethodName ], colors = defaults.consoleDirExtensionColors, depth = defaults.consoleDirExtensionDepth, showHidden = defaults.consoleDirExtensionShowHidden) {
        monkeyPatchConsole(methodNames, colors, depth, showHidden);
    }

    #formatInfoMutation(options) {
        return winstonFormat((info) => {
            info.id = info.id || options.id || null;
            info.ip = info.ip || options.ip || null;
            info.user = info.user || options.user || null;
            return info;
        });
    }

    #getBuiltinFormat(format, options) {
        options = options || { };
        switch (format) {
            case wf.COLORIZE: return winstonFormat.colorize();
            case wf.JSON: return winstonFormat.json();
            case wf.METADATA: return winstonFormat.metadata();
            case wf.PRETTY_PRINT: return winstonFormat.prettyPrint();
            case wf.SIMPLE: return winstonFormat.simple();
            case wf.SPLAT: return winstonFormat.splat();
            case wf.TIMESTAMP: return winstonFormat.timestamp();
            case wf.ZEDDEMORE_INFO_MUTATION: return this.#formatInfoMutation(options)();
            case wf.ZEDDEMORE_LABEL: return winstonFormat.label({ label: options.label || this.defaultLabel });
            case wf.ZEDDEMORE_PRINTF: return winstonFormat.printf(this.#buildWinstonTemplate);
            case wf.ZEDDEMORE_TIMESTAMP: return winstonFormat.timestamp({ format: this.winstonTimestampFormat });
        }
    }

    #getBuiltinTransport(transport) {
        let logLevel = this.logLevel;
        const logLevelType = transportLogLevelType(transport);
        switch (logLevelType) {
            case llt.CONSOLE: logLevel = this.logLevel; break;
            case llt.EMAIL: logLevel = this.emailLogLevel; break;
        }
        switch (transport) {
            case wt.CONSOLE: return this.#buildWinstonConsoleTransport(logLevel);
            case wt.EMAIL: return this.#buildWinstonEmailTransport(logLevel);
        }
    }

    #getDefaultFormats(options) {
        return _.compact(defaults.winstonFormats.map((format) => this.#getBuiltinFormat(format, options)));
    }

    #getDefaultTransports() {
        return _.compact(defaults.winstonTransports.map((transport) => {
            switch (transport) {
                case wt.CONSOLE: return this.doConsoleLog ? wt.CONSOLE : null;
                case wt.EMAIL: return (this.doEmailLog && this.canEmailLog) ? wt.EMAIL : null;
                default: return transport;
            }
        }));
    }

    /**
     * Get a Zeddemore Logger wrapper instance with all transports
     * @param {Object} options
     * @param {[Format|String]} [options.formats]
     * @param {String} [options.level]
     * @param {ZeddemoreLoggerController} [options.logger]
     * @param {[Object|String]} [options.transports]
     * @param {Object} [options.user]
     * @returns {ZeddemoreLoggerController}
     */
    static getLogger(options) {
        options = options || { };
        /** @type {app} app */
        const logger = options.logger || (options.user ? options.user.logger : null) || ((app && app.locals) ? app.locals.logger : null);
        if (logger instanceof ZeddemoreLoggerController) return logger;
        const zeddemoreLogger = new ZeddemoreLogger(options);
        return zeddemoreLogger.createLoggerController(options);
    }

    /**
     * Initialize Morgan logging
     * @param {Boolean} [colorize]
     */
    #initializeMorgan(colorize = this.colorize) {
        function buildContentLengthFormatToken(res, decimals = defaults.contentLengthDigits) {
            const contentLength = convertBytes(res.get('content-length'), { decimals });
            return contentLength ? ` - ${ contentLength }` : '';
        }
        /**
         * @param {Object} req
         * @param {String} [req.originalUrl]
         * @param {String} [req.url]
         * @returns {string}
         */
        function buildDecodedUrl(req) {
            const url = req.originalUrl || req.url;
            return decodeURI(url);
        }
        function buildResponseTimeFormatToken(req, res, digits = defaults.responseTimeDigits) {
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
        const morganTokens = colorize ? defaults.morganFormatTokensColorized : defaults.morganFormatTokens;
        morgan.format(mf.ZEDDEMORE, this.#buildMorganFormat(morganTokens));
    }

    #isSequelizeModel(model) {
        return _.isObject(model) && Object.hasOwn(model, 'create') && Object.hasOwn(model, 'findOne');
    }

    /**
     * Log a message for the specified log level
     * @param {number|String} logLevel
     * @returns {Function}
     */
    log = (logLevel) => {
        logLevel = logLevel || this.logLevel;
        const logLevelName = winstonLogLevelName(logLevel);
        return this.logger[ logLevelName ];
    }

    /**
     * Log server information
     * @param {Object} options
     * @param {Boolean} [options.showLogLevel=true]
     * @param {String} [options.url]
     * @param {number|String} [logLevel=wll.INFO]
     * @returns {void}
     */
    #logServerInfo = (options, logLevel = wll.INFO) => {
        options = options || { };
        const serverUrl = options.url || this.serverUrl;
        const showLogLevel = _.isBoolean(options.showLogLevel) ? options.showLogLevel : true;
        const showUrl = _.isBoolean(options.showUrl) ? options.showUrl : true;
        const logLevelLabel = chalkLogLevel(this.logLevel, this.logLevelName.toUpperCase());
        const msgParts = [ `Server is ${ chalk.bold(chalk.yellowBright(defaults.liveMessage)) }` ];
        if (showLogLevel) msgParts.push(`with log level ${ logLevelLabel }${ this.forceLogLevel ? ` (${ chalk.italic('forced') })` : '' }`);
        if (showUrl) msgParts.push(`at ${ chalk.underline(serverUrl) }`);
        this.log(logLevel)(msgParts.join(' '));
    }

    /**
     * Log server listening information
     * @param {Object} options
     * @param {String} [options.environment]
     * @param {String} [options.instance]
     * @param {String} [options.name]
     * @param {number} [options.port]
     * @param {number|String} [logLevel=wll.INFO]
     * @returns {void}
     */
    #logServerListening = (options, logLevel = wll.INFO) => {
        const serverEnvironment = options.environment || this.serverEnvironment;
        const serverInstance = options.instance || this.serverInstance;
        const serverName = options.name || this.serverName;
        const serverPort = options.port || this.serverPort;
        const msgParts = [ ];
        const serverParts = [ serverName ];
        if (serverEnvironment) serverParts.push(serverEnvironment);
        if (serverInstance) serverParts.push(serverInstance);
        msgParts.push(`[${ serverParts.join(':') }]`);
        msgParts.push(`Node.js Express server listening on port ${ chalk.bold(serverPort) }`);
        this.log(logLevel)(msgParts.join(' '));
    }

    /**
     * Log server packages information
     * @param {[Object]} packages
     * @param {number|String} [logLevel=wll.INFO]
     * @returns {void}
     */
    #logServerPackagesInfo = (packages, logLevel = wll.INFO) => {
        function buildVersionLabel(_package) {
            if (!_package || !_package.name || !_package.version) return null;
            const packageName = _package.style ? chalkTarget(_package.name, _package.style) : chalkPackage(_package.name);
            return `${ packageName }@${ _package.version }`;
        }
        const versionParts = _.compact(_.sortBy(packages, (_package) => _package.name.toUpperCase()).map(buildVersionLabel));
        this.log(logLevel)(`Packages: [ ${ versionParts.join(', ') } ]`);
    }

    /**
     * Log server routes added
     * @param {Object} options
     * @param {[String]} [options.categories]
     * @param {[String]} [options.routes]
     * @param {Boolean} [options.showCategories=true]
     * @param {number|String} [logLevel=wll.INFO]
     * @returns {void}
     */
    #logServerRoutesAdded = (options, logLevel = wll.INFO) => {
        options = options || { };
        const showCategories = _.isBoolean(options.showCategories) ? options.showCategories : true;
        const routes = options.routes || this.apiRoutes || [ ];
        const routesLabel = (routes.length === 1) ? 'route' : 'routes';
        const addedLabel = chalk.green('added');
        const msgParts = [ `${ routes.length } ${ routesLabel } ${ addedLabel }` ];
        if (showCategories) {
            const categories = options.categories || this.apiRouteCategories || [];
            msgParts.push(`in: [ ${ categories.sort().join(', ') } ]`);
        }
        this.log(logLevel)(msgParts.join(', '));
    }

    /**
     * Log server startup information
     * @param {Object} options
     * @param {[String]} [options.categories]
     * @param {String} [options.environment]
     * @param {String} [options.instance]
     * @param {String} [options.name]
     * @param {number} [options.port]
     * @param {[Object]} [options.packages]
     * @param {[String]} [options.routes]
     * @param {Boolean} [options.showCategories=true]
     * @param {Boolean} [options.showInfo=true]
     * @param {Boolean} [options.showListening=true]
     * @param {Boolean} [options.showLogLevel=true]
     * @param {Boolean} [options.showPackages=true]
     * @param {Boolean} [options.showRoutes=true]
     * @param {number|String} [logLevel=wll.INFO]
     * @returns {void}
     */
    logServerStartup = (options, logLevel = wll.INFO) => {
        options = options || { };
        const showListening = _.isBoolean(options.showListening) ? options.showListening : true;
        const showPackages = _.isBoolean(options.showPackages) ? options.showPackages : true;
        const showRoutes = _.isBoolean(options.showRoutes) ? options.showRoutes : true;
        const showInfo = _.isBoolean(options.showInfo) ? options.showInfo : true;
        if (showListening) this.#logServerListening(options, logLevel);
        if (showPackages && options.packages) this.#logServerPackagesInfo(options.packages, logLevel);
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

    /**
     * Create Morgan middleware for logging HTTP requests
     * @param {Object} options
     * @param {Boolean} [options.colorize]
     * @param {Boolean} [options.disableMorganLogging]
     * @param {String} [options.morganFormat]
     * @returns {function(*, *, *): void}
     */
    morganMiddleware = (options) => {
        options = options || { };
        const colorize = _.isBoolean(options.colorize) ? options.colorize : this.colorize;
        const disableMorganLogging = _.isBoolean(options.disableMorganLogging) ? options.disableMorganLogging : !this.httpRequestLogging;
        const morganFormat = options.morganFormat || this.#buildMorganFormat(defaults.morganFormatTokens);
        return (req, res, next) => {
            this.#initializeMorgan(colorize);
            return morgan(morganFormat, {
                skip: () => disableMorganLogging,
                stream: {
                    write: (message) => {
                        if (this.canSequelizeLogApiCall) this.#writeApiCallToDatabase(req, res, options);
                        const logOptions = { };
                        const user = this.userGetFn(req, res);
                        if (user) logOptions.user = user;
                        const response = colorize ? this.#colorizeResponse(message.trim()) : message.trim();
                        const logger = ZeddemoreLogger.getLogger(logOptions);
                        logger.http(response);
                        if (this.doEmailLog && this.canEmailLog) {
                            const statusCode = extractHttpStatusCode(message);
                            if (isResponseFailure(statusCode, [ 404 ])) {
                                logger.logEmail({ level: wlln.ERROR, message: response });
                            }
                        }
                    },
                },
            })(req, res, next);
        }
    }

    requestLoggerMiddleware = (req, res, next) => {
        const requestValues = parseRequest(req);
        const requestId = generateUuid();
        req[ this.requestIdAttribute ] = requestId;
        res.header(rqh.REQUEST_ID, requestId);
        const ipAddress = requestValues.ipAddress;
        res.locals = res.locals || { };
        res.locals.user = res.locals.user || { };
        res.locals.user.logger = this.createRequestLogger(requestId, ipAddress);
        return next();
    }

    routeLoggingMiddleware = (req, res, next) => {
        if (!this.canSequelizeLogRoute) return next();
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

    userLoggerMiddleware = (req, res, next) => {
        const requestId = this._getRequestId(req);
        /** @type {user} */
        const user = this.userGetFn(req, res) || { };
        if (!requestId) return next();
        const username = user.username || user.login || null;
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

    #writeApiCallToDatabase = async (req, res, options) => {
        options = options || { };
        if (!this.canSequelizeLogApiCall || !req) return;
        const user = this.userGetFn(req, res) || { };
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
                await this.apiCallSequelizeModel.create(appCallValues);
            } catch (e) {
                console.error(e);
                ZeddemoreLogger.getLogger({ user }).error('Api call logging failed, moving on');
            }
        }
    }

    #writeRouteToDatabase = async (routeValues) => {
        if (!this.canSequelizeLogRoute || !routeValues) return;
        const matchedRoute = this.#matchPathToRoute(routeValues.route);
        if (matchedRoute) {
            try {
                const route = await this.routeSequelizeModel.findOne({ where: { route: matchedRoute }, logging: false });
                if (route) {
                    route.count++;
                    route.lastCalledAt = new Date();
                    route.save();
                } else {
                    this.routeSequelizeModel.create({
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
        const logLevel = winstonLogLevelName(logOptions.logLevel);
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
        const contentLengthDigits = logOptions.contentLengthDigits || logger.contentLengthDigits || defaults.contentLengthDigits;
        const contentLength = _contentLength ? `- ${ convertBytes(_contentLength, contentLengthDigits) }` : null;
        const parts = [ prefix, method, path, configData, status, responseData, duration, contentLength ];
        const message = _.compact(parts).join(' ');
        logger[ logLevel ](message);
    }

}

module.exports = ZeddemoreLogger;
