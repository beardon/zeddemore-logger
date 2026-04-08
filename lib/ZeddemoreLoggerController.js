// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const winston = require('winston');

const enums = require('./enums');

const { Logger } = winston;
const { winstonLogLevelNames: wlln } = enums;

class ZeddemoreLoggerController {

    /** @type {winston.Logger} */
    #winstonEmailLogger = null;
    /** @type {winston.Logger} */
    #winstonLogger = null;

    constructor(options) {
        options = options || { };
        this.logger = options.logger;
        this.emailLogger = options.emailLogger;
    }

    get emailLogger() {
        return this.#winstonEmailLogger;
    }

    set emailLogger(value) {
        if (value instanceof Logger) {
            this.#winstonEmailLogger = value;
        }
    }

    get hasWinstonEmailLogger() {
        return (this.#winstonEmailLogger instanceof Logger);
    }

    get hasWinstonLogger() {
        return (this.#winstonLogger instanceof Logger);
    }

    get logger() {
        return this.#winstonLogger;
    }

    set logger(value) {
        if (value instanceof Logger) {
            this.#winstonLogger = value;
            this.#buildWinstonLogLevelFunctions(this.#winstonLogger);
        }
    }

    #buildWinstonLogLevelFunctions(logger) {
        if (!(logger instanceof Logger)) return
        for (const levelName of Object.values(wlln)) {
            if (_.isFunction(logger[ levelName ])) {
                this[ levelName ] = (...args) => {
                    logger[ levelName ](...args);
                }
            } else {
                this[ levelName ] = () => this.#noop();
            }
        }
    }

    child = (...args) => {
        if (this.hasWinstonLogger) return this.#winstonLogger.child(...args);
        return this.#noop();
    }

    log = (options) => {
        if (this.hasWinstonLogger) return this.#winstonLogger.log(options);
        return this.#noop()
    }

    logEmail = (options) => {
        if (this.hasWinstonEmailLogger) return this.#winstonEmailLogger.log(options);
        return this.#noop()
    }

    #noop = () => {
        // No operation function, used to prevent errors when logger methods are called but no logger is set.
    }

}

module.exports = ZeddemoreLoggerController;
