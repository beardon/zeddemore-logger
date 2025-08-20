// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const winston = require('winston');

const enums = require('./enums');
const ZeddemoreProgressMultibar = require('./ZeddemoreProgressMultibar');

const { Logger } = winston;
const { winstonLogLevelNames: wlln } = enums;

class ZeddemoreLoggerController {

    /** @type {ZeddemoreProgressMultibar} */
    #multiBar = null;
    /** @type {winston.Logger} */
    #winstonLogger = null;

    constructor(options) {
        options = options || { };
        this.logger = options.logger;
        this.progress = options.progress;
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
            this.#buildWinstonLogLevelFunctions();
        }
    }

    get progress() {
        return this.#multiBar;
    }

    set progress(value) {
        if (value instanceof ZeddemoreProgressMultibar) this.#multiBar = value;
    }

    #buildWinstonLogLevelFunctions() {
        if (!this.hasWinstonLogger) return;
        for (const levelName of Object.values(wlln)) {
            if (_.isFunction(this.#winstonLogger[ levelName ])) {
                this[ levelName ] = (...args) => {
                    this.#winstonLogger[ levelName ](...args);
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

    #noop = () => {
        // No operation function, used to prevent errors when logger methods are called but no logger is set.
    }

}

module.exports = ZeddemoreLoggerController;
