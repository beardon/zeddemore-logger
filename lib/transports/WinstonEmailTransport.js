// Copyright (c) 2026 by Beardon Services, Inc.

const _ = require('lodash');
const ansiHTML = require('ansi-html');
const { createTransport } = require('nodemailer');
const { hostname } = require('node:os');
const { stripVTControlCharacters } = require('node:util');
const Transport = require('winston-transport');

/**
 * @class
 * @extends Transport
 */
class WinstonEmailTransport extends Transport {

    _messageOptions = { };
    #useHtml = false;

    /**
     * @callback FilterFunction
     * @param {Object} info
     * @param {string} info.level
     * @param {string} info.message
     * @returns {boolean}
     *
     * @param {Object} [options={}] Options for this instance
     * @param {Object} [options.transportOptions]
     * @param {Object} [options.messageOptions]
     * @param {string} [options.messageOptions.to]
     * @param {string} [options.messageOptions.from]
     * @param {string} [options.messageOptions.subject]
     * @param {FilterFunction} [options.messageOptions.filter]
     * @throws {Error} if options.messageOptions.to is empty or not set
     */
    constructor(options) {
        options = options || { };
        const { messageOptions = { }, transportOptions = { }, ...winstonOptions } = options;
        super(winstonOptions);
        if (!_.isString(messageOptions.to) || !messageOptions.to.length) {
            throw new Error('WinstonEmailTransport requires \'to\' property');
        }
        /**
         * @member {Object} _messageOptions
         * @member {string} _messageOptions.to
         * @member {string} _messageOptions.from
         * @member {string} _messageOptions.subject
         * @member {FilterFunction} _messageOptions.filter
         * @private
         */
        this._messageOptions = {
            ...messageOptions,
            from: messageOptions.from ?? `winston@${ hostname() }`,
            subject: messageOptions.subject ?? 'Winston Log',
            filter: messageOptions.filter ?? (() => true),
        };
        this.name = 'WinstonEmailTransport';
        /**
         * @member {object}
         * @private
         */
        this._transportOptions = transportOptions;
        this.useHtml = winstonOptions.useHtml;
    }

    get useHtml() {
        return this.#useHtml;
    }

    set useHtml(useHtml) {
        if (_.isBoolean(useHtml)) this.#useHtml = useHtml;
    }

    /**
     * Core logging method exposed to Winston
     *
     * @callback NextFunction
     * @returns {void}
     *
     * @param {Object} info
     * @param {string} info.level
     * @param {string} info.message
     * @param {NextFunction} callback
     */
    log(info, callback) {
        try {
            if (!this._messageOptions.filter(info)) {
                setImmediate(callback);
                return;
            }
            const { level, message, ...meta } = info;
            const _level = stripVTControlCharacters(level);
            const _message = stripVTControlCharacters(_.isObject(message) ? JSON.stringify(message) : message);
            /** @type {Object.<string,*>} messageOptions */
            const { filter, ...messageOptions } = { ...this._messageOptions }
            const subject = messageOptions.subject.replace(/{{\s*level\s*}}/g, _level).replace(/{{\s*message\s*}}/g, `${ _message }`.split('\n')[ 0 ]);
            const content = meta[ Symbol.for('message') ];
            const html = ansiHTML(content);
            const text = stripVTControlCharacters(content);
            messageOptions.subject = subject;
            if (this.useHtml) messageOptions.html = html;
            messageOptions.text = text;
            const transporter = createTransport(this._transportOptions);
            transporter.sendMail(
                messageOptions,
                /**
                 * @fires WinstonEmailTransport#error
                 * @fires WinstonEmailTransport#logged
                 * @param {?Error} err
                 * @param {Object} info
                 */
                (err, info) => {
                    setImmediate(callback);
                    if (err) {
                        this.emit('error', err);
                    } else {
                        this.emit('logged', info);
                    }
                }
            );
        } catch (e) {
            console.error(e);
            console.error('Email logging failed, moving on');
        }
    }
}

module.exports = WinstonEmailTransport;
