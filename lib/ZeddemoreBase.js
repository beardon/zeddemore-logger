// Copyright (c) 2025-2026 by Beardon Services, Inc.

const _ = require('lodash');
const chalk = require('chalk');
const { DateTime } = require('luxon');

const { convertFechaDateFormatToLuxon } = require('./date');
const defaults = require('./defaults');
const { isWinstonLogLevel, winstonLogLevelName } = require('./logging');
const { stringToIdempotentHexColor } = require('./color');
require('./typedef');

class ZeddemoreBase {

    #contentLengthDigits = defaults.contentLengthDigits;
    #defaultLabel = null;
    #displayCaller = true;
    #displayIpAddress = true;
    #displayRequestId = true;
    #colorize = true;
    #customCallerSettings = [ ];
    #defaultUserLogLevel = defaults.userLogLevel;
    #forceLogLevel = false;
    /** @type {String} */
    #logLevel = defaults.winstonLogLevelName;
    #requestIdAttribute = defaults.requestIdAttribute;
    #responseTimeDigits = defaults.responseTimeDigits;
    #timestampFormat = defaults.timestampFormat;
    #userGetFn = null;

    constructor(options) {
        options = options || { };
        this.colorize = options.colorize;
        this.contentLengthDigits = options.contentLengthDigits;
        this.defaultLabel = options.defaultLabel || this.constructor.name;
        this.displayCaller = options.displayCaller;
        this.displayIpAddress = options.displayIpAddress;
        this.displayRequestId = options.displayRequestId;
        this.customCallerSettings = options.customCallerSettings;
        this.defaultUserLogLevel = options.userLogLevel;
        this.forceLogLevel = options.forceLogLevel;
        this.logLevel = options.logLevel;
        this.responseTimeDigits = options.responseTimeDigits;
        this.timestampFormat = options.timestampFormat;
        this.requestIdAttribute = options.requestIdAttribute;
        this.userGetFn = options.userGetFn;
    }

    get colorize() {
        return this.#colorize;
    }

    set colorize(doColorize) {
        if (_.isBoolean(doColorize)) this.#colorize = doColorize;
    }

    get contentLengthDigits() {
        return this.#contentLengthDigits;
    }

    set contentLengthDigits(digits) {
        if (_.isInteger(digits) && (digits >= 0)) this.#contentLengthDigits = digits;
    }

    get defaultLabel() {
        return this.#defaultLabel;
    }

    set defaultLabel(label) {
        if (_.isString(label) && !!label.length) this.#defaultLabel = label;
    }

    get displayCaller() {
        return this.#displayCaller;
    }

    set displayCaller(doDisplay) {
        if (_.isBoolean(doDisplay)) this.#displayCaller = doDisplay;
    }

    get displayIpAddress() {
        return this.#displayIpAddress;
    }

    set displayIpAddress(doDisplay) {
        if (_.isBoolean(doDisplay)) this.#displayIpAddress = doDisplay;
    }

    get displayRequestId() {
        return this.#displayRequestId;
    }

    set displayRequestId(doDisplay) {
        if (_.isBoolean(doDisplay)) this.#displayRequestId = doDisplay;
    }

    get customCallerSettings() {
        return this.#customCallerSettings;
    }

    set customCallerSettings(settings) {
        if (_.isArray(settings)) this.#customCallerSettings = settings;
    }

    get defaultUserLogLevel() {
        return this.#defaultUserLogLevel;
    }

    set defaultUserLogLevel(level) {
        if (isWinstonLogLevel(level)) this.#defaultUserLogLevel = winstonLogLevelName(level);
    }

    get forceLogLevel() {
        return this.#forceLogLevel;
    }

    set forceLogLevel(doForce) {
        if (_.isBoolean(doForce)) this.#forceLogLevel = doForce;
    }

    /** @type {String} */
    get logLevel() {
        return this.#logLevel;
    }

    set logLevel(level) {
        if (isWinstonLogLevel(level)) this.#logLevel = winstonLogLevelName(level);
    }

    get logLevelName() {
        return winstonLogLevelName(this.logLevel);
    }

    get luxonTimestampFormat() {
        return convertFechaDateFormatToLuxon(this.timestampFormat);
    }

    get responseTimeDigits() {
        return this.#responseTimeDigits;
    }

    set responseTimeDigits(digits) {
        if (_.isInteger(digits) && (digits >= 0)) this.#responseTimeDigits = digits;
    }

    get requestIdAttribute() {
        return this.#requestIdAttribute;
    }

    set requestIdAttribute(attribute) {
        if (_.isString(attribute) && !!attribute.length) this.#requestIdAttribute = attribute;
    }

    get timestamp() {
        return DateTime.now().toFormat(this.luxonTimestampFormat);
    }

    get timestampFormat() {
        return this.#timestampFormat;
    }

    set timestampFormat(format) {
        if (_.isString(format) && !!format.length) this.#timestampFormat = format;
    }

    get userGetFn() {
        if (this.#isValidUserGetFn(this.#userGetFn)) return this.#userGetFn;
        return this.#defaultUserGetFn;
    }

    set userGetFn(fn) {
        if (_.isFunction(fn)) this.#userGetFn = fn;
    }

    get values() {
        return {
            contentLengthDigits: this.contentLengthDigits,
            defaultLabel: this.defaultLabel,
            displayCaller: this.displayCaller,
            displayIpAddress: this.displayIpAddress,
            colorize: this.colorize,
            customCallerSettings: this.customCallerSettings,
            defaultUserLogLevel: this.defaultUserLogLevel,
            forceLogLevel: this.forceLogLevel,
            logLevel: this.logLevel,
            requestIdAttribute: this.requestIdAttribute,
            responseTimeDigits: this.responseTimeDigits,
            timestampFormat: this.timestampFormat,
            userGetFn: this.userGetFn,
        };
    }

    get winstonTimestampFormat() {
        return this.timestampFormat;
    }

    /**
     * Build log message prefix
     * @param {String} [level]
     * @param {Metadata} [metadata]
     * @param {Boolean} [colorize]
     * @returns {string}
     */
    _buildLogMessagePrefix = (level, metadata, colorize = this.colorize) => {
        metadata = this._structureMetadata(metadata);
        const callerDisplay = metadata.caller || metadata.ip;
        const idHexColor = colorize ? stringToIdempotentHexColor(metadata.id, true) : null;
        const callerHexColor = colorize ? this.#callerToHexColor(callerDisplay) : null;
        const parts = [ ];
        if (!!metadata.timestamp) parts.push(metadata.timestamp);
        if (!!metadata.label) parts.push(`[${ metadata.label }]`);
        if (!!level) parts.push(`${ level }:`);
        if (!!metadata.id && this.displayRequestId) {
            if (colorize) {
                parts.push(chalk.bold.hex(idHexColor)(metadata.fullId));
            } else {
                parts.push(metadata.fullId);
            }
        }
        const callerParts = [ ];
        if (!!metadata.caller && this.displayCaller) {
            /**
             * @type {Object}
             * @property {String} caller
             * @property {String} [logPrefix]
             */
            const customCallerSettings = _.find(this.customCallerSettings, { caller: metadata.caller });
            const logPrefix = customCallerSettings ? customCallerSettings.logPrefix : null;
            callerParts.push(logPrefix ? logPrefix + metadata.caller : metadata.caller);
        }
        if (!!metadata.ip && this.displayIpAddress) callerParts.push(metadata.ip);
        const fullCaller = callerParts.join('@');
        if (!!fullCaller) {
            if (colorize) {
                parts.push(`<${ chalk.underline.hex(callerHexColor).bold(fullCaller) }>`);
            } else {
                parts.push(`<${ fullCaller }>`);
            }
        }
        if (!!metadata.prefix) parts.push(`[${ metadata.prefix }]`);
        return parts.join(' ').trim();
    }

    #callerToHexColor = (caller) => {
        if (!caller) return defaults.colorConsoleWhiteHex;
        const customCallerSetting = _.find(this.customCallerSettings, { caller });
        if (customCallerSetting && customCallerSetting.color && customCallerSetting.color.fore) return customCallerSetting.color.fore;
        return stringToIdempotentHexColor(caller, true);
    }

    /**
     * Get the user object from the request or response
     * @param {Object} req
     * @param {Object} [req.locals]
     * @param {Object} [req.locals.user]
     * @param {Object} [req.user]
     * @param {Object} res
     * @param {Object} [res.locals]
     * @param {Object} [res.locals.user]
     * @returns {Object|null}
     */
    #defaultUserGetFn(req, res) {
        const reqLocalsUser = (_.isObject(req) && _.isObject(req.locals) && _.isObject(req.locals.user)) ? req.locals.user : null;
        const reqUser = (_.isObject(req) && _.isObject(req.user)) ? req.user : null;
        const resLocalsUser = (_.isObject(res) && _.isObject(res.locals) && _.isObject(res.locals.user)) ? res.locals.user : null;
        return resLocalsUser || reqLocalsUser || reqUser || null;
    }

    _getRequestId = (req) => {
        if (!req) return null;
        return req[ this.requestIdAttribute ];
    }

    #isValidUserGetFn(fn) {
        return _.isFunction(fn) && (fn.length === 2);
    }

    _structureMetadata = (metadata) => {
        metadata = (_.isObject(metadata)) ? metadata : { };
        const id = metadata.id ? metadata.id.substring(0, 8) : null;
        const label = metadata.label || null;
        const subId = metadata.subId || null;
        const target = metadata.target || null;
        return {
            caller: metadata.caller || metadata.user || null,
            fullId: `${ defaults.requestIdIcon }${ id }${ (subId ? `[${ subId }]` : '') }`,
            id,
            ip: metadata.ip || null,
            label: target || label || this.defaultLabel,
            originalLabel: label,
            prefix: metadata.prefix || null,
            raw: !!metadata.raw,
            subId,
            target,
            timestamp: metadata.timestamp || this.timestamp,
        }
    }

}

module.exports = ZeddemoreBase;
