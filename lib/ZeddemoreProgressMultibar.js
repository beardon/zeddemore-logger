// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');
const { MultiBar } = require('cli-progress');

const { chalkTarget } = require('./color');
const defaults = require('./defaults');
const enums = require('./enums');
require('./typedef');
const ZeddemoreBase = require('./ZeddemoreBase');

const { chalkFormats: cf, doesEnumInclude, progressBarAlignments: pba } = enums;

class ZeddemoreProgressMultibar extends ZeddemoreBase {

    #alignment = pba.LEFT;
    #autoPadding = false;
    #autoPaddingCharacter = ' ';
    #barColorBack = null;
    #barColorFore = null;
    #barColorFormat = cf.HEX;
    #barFormat = defaults.progressBarBarFormat;
    #clearOnComplete = false;
    #completeCharacter = defaults.progressBarCompleteCharacter;
    #durationColorBack = null;
    #durationColorFore = null;
    #durationColorFormat = cf.HEX;
    #durationFormat = defaults.progressBarDurationFormat;
    #durationFormatted = false;
    #durationFormattedFormat = defaults.progressBarDurationFormattedFormat;
    #emptyOnZero = false;
    #etaBuffer = 10;
    #etaColorBack = null;
    #etaColorFore = null;
    #etaColorFormat = cf.HEX;
    #etaFormat = defaults.progressBarEtaFormat;
    #etaFormatted = false;
    #etaFormattedFormat = defaults.progressBarEtaFormattedFormat;
    #forceRedraw = false;
    #format = null;
    #formatBarFunction = null;
    #formatDelimiter = defaults.progressBarDelimiter;
    #formatTimeFunction = null;
    #formatValueFunction = null;
    #fps = 10;
    #glue = '';
    #hideCursor = true;
    #incompleteCharacter = defaults.progressBarIncompleteCharacter;
    #info = null;
    #label = null;
    #lineWrap = false;
    /** @type {Metadata} */
    #metadata = null;
    /** @type {MultiBar} */
    #multiBar = null;
    #percentageColorBack = null;
    #percentageColorFore = null;
    #percentageColorFormat = cf.HEX;
    #percentageFormat = defaults.progressBarPercentageFormat;
    #postfixFormat = defaults.progressBarPostfixFormat;
    #prefix = null;
    #progressCalculationRelative = false;
    #showBar = true;
    #showDuration = false;
    #showEta = false;
    #showPercentage = true;
    #showPostfix = true;
    #showPrefix = true;
    #showTotal = true;
    #showValue = true;
    #size = 40;
    #stream = process.stderr;
    #stopOnComplete = true;
    #totalFormat = defaults.progressBarTotalFormat;
    #valueColorBack = null;
    #valueColorFore = null;
    #valueColorFormat = cf.HEX;
    #valueFormat = defaults.progressBarValueFormat;

    constructor(options) {
        super(options);
        this.#processOptions(options);
    }

    get alignment() {
        return this.#alignment;
    }

    set alignment(value) {
        if (this.#isAlignment(value)) this.#alignment = value;
    }

    get autoPadding() {
        return this.#autoPadding;
    }

    set autoPadding(value) {
        if (_.isBoolean(value)) this.#autoPadding = value;
    }

    get autoPaddingCharacter() {
        return this.#autoPaddingCharacter;
    }

    set autoPaddingCharacter(value) {
        if (_.isString(value) && (value.length === 1)) this.#autoPaddingCharacter = value;
    }

    get barColorBack() {
        return this.#barColorBack;
    }

    set barColorBack(value) {
        if (_.isString(value) && !!value.length) this.#barColorBack = value.trim();
    }

    get barColorFore() {
        return this.#barColorFore;
    }

    set barColorFore(value) {
        if (_.isString(value) && !!value.length) this.#barColorFore = value.trim();
    }

    get barColorStyle() {
        return this.#buildColorStyle(this.#barColorFormat, this.barColorFore, this.barColorBack);
    }

    get barFormat() {
        return this.#barFormat;
    }

    set barFormat(value) {
        if (_.isString(value) && !!value.length) this.#barFormat = value;
    }

    get clearOnComplete() {
        return this.#clearOnComplete;
    }

    set clearOnComplete(value) {
        if (_.isBoolean(value)) this.#clearOnComplete = value;
    }

    get completeCharacter() {
        return this.#completeCharacter;
    }

    set completeCharacter(value) {
        if (_.isString(value) && (value.length === 1)) this.#completeCharacter = value;
    }

    get durationColorBack() {
        return this.#durationColorBack;
    }

    set durationColorBack(value) {
        if (_.isString(value) && !!value.length) this.#durationColorBack = value.trim();
    }

    get durationColorFore() {
        return this.#durationColorFore;
    }

    set durationColorFore(value) {
        if (_.isString(value) && !!value.length) this.#durationColorFore = value.trim();
    }

    get durationColorStyle() {
        return this.#buildColorStyle(this.#durationColorFormat, this.durationColorFore, this.durationColorBack);
    }

    get durationFormat() {
        return this.#durationFormat;
    }

    set durationFormat(value) {
        if (_.isString(value) && !!value.length) this.#durationFormat = value;
    }

    get durationFormatted() {
        return this.#durationFormatted;
    }

    set durationFormatted(value) {
        if (_.isBoolean(value)) this.#durationFormatted = value;
    }

    get durationFormattedFormat() {
        return this.#durationFormattedFormat;
    }

    set durationFormattedFormat(value) {
        if (_.isString(value) && !!value.length) this.#durationFormattedFormat = value;
    }

    get emptyOnZero() {
        return this.#emptyOnZero;
    }

    set emptyOnZero(value) {
        if (_.isBoolean(value)) this.#emptyOnZero = value;
    }

    get etaBuffer() {
        return this.#etaBuffer;
    }

    set etaBuffer(value) {
        if (_.isInteger(value) && (value >= 0)) this.#etaBuffer = value;
    }

    get etaColorBack() {
        return this.#etaColorBack;
    }

    set etaColorBack(value) {
        if (_.isString(value) && !!value.length) this.#etaColorBack = value.trim();
    }

    get etaColorFore() {
        return this.#etaColorFore;
    }

    set etaColorFore(value) {
        if (_.isString(value) && !!value.length) this.#etaColorFore = value.trim();
    }

    get etaColorStyle() {
        return this.#buildColorStyle(this.#etaColorFormat, this.etaColorFore, this.etaColorBack);
    }

    get etaFormat() {
        return this.#etaFormat;
    }

    set etaFormat(value) {
        if (_.isString(value) && !!value.length) this.#etaFormat = value;
    }

    get etaFormatted() {
        return this.#etaFormatted;
    }

    set etaFormatted(value) {
        if (_.isBoolean(value)) this.#etaFormatted = value;
    }

    get etaFormattedFormat() {
        return this.#etaFormattedFormat;
    }

    set etaFormattedFormat(value) {
        if (_.isString(value) && !!value.length) this.#etaFormattedFormat = value;
    }

    get forceRedraw() {
        return this.#forceRedraw;
    }

    set forceRedraw(value) {
        if (_.isBoolean(value)) this.#forceRedraw = value;
    }

    get format() {
        if (!!this.#format) return this.#format;
        return this.#buildFormat();
    }

    set format(value) {
        if (_.isString(value)) this.#format = value.trim();
    }

    get formatBarFunction() {
        return this.#formatBarFunction;
    }

    set formatBarFunction(value) {
        if (_.isFunction(value)) this.#formatBarFunction = value;
    }

    get formatDelimiter() {
        return this.#formatDelimiter;
    }

    set formatDelimiter(value) {
        if (_.isString(value)) this.#formatDelimiter = value;
    }

    get formatTimeFunction() {
        return this.#formatTimeFunction;
    }

    set formatTimeFunction(value) {
        if (_.isFunction(value)) this.#formatTimeFunction = value;
    }

    get formatValueFunction() {
        return this.#formatValueFunction;
    }

    set formatValueFunction(value) {
        if (_.isFunction(value)) this.#formatValueFunction = value;
    }

    get fps() {
        return this.#fps;
    }

    set fps(value) {
        if (_.isInteger(value) && (value > 0)) this.#fps = value;
    }

    get glue() {
        return this.#glue;
    }

    set glue(value) {
        if (_.isString(value)) this.#glue = value;
    }

    get hasBarColor() {
        return !!this.#barColorFore || !!this.#barColorBack;
    }

    get hasDurationColor() {
        return !!this.#durationColorFore || !!this.#durationColorBack;
    }

    get hasEtaColor() {
        return !!this.#etaColorFore || !!this.#etaColorBack;
    }

    get hasFormatBar() {
        return _.isFunction(this.#formatBarFunction);
    }

    get hasFormatTime() {
        return _.isFunction(this.#formatTimeFunction);
    }

    get hasFormatValue() {
        return _.isFunction(this.#formatValueFunction);
    }

    get hasMultiBar() {
        return (this.#multiBar instanceof MultiBar);
    }

    get hasPercentageColor() {
        return !!this.#percentageColorFore || !!this.#percentageColorBack;
    }

    get hasValueColor() {
        return !!this.#valueColorFore || !!this.#valueColorBack;
    }

    get hideCursor() {
        return this.#hideCursor;
    }

    set hideCursor(value) {
        if (_.isBoolean(value)) this.#hideCursor = value;
    }

    get incompleteCharacter() {
        return this.#incompleteCharacter;
    }

    set incompleteCharacter(value) {
        if (_.isString(value) && (value.length === 1)) this.#incompleteCharacter = value;
    }

    get info() {
        return this.#info;
    }

    set info(value) {
        if (_.isObject(value)) this.#info = value;
    }

    get label() {
        return this.#label;
    }

    set label(value) {
        if (_.isString(value) && !!value.length) this.#label = value.trim();
    }

    get lineWrap() {
        return this.#lineWrap;
    }

    set lineWrap(value) {
        if (_.isBoolean(value)) this.#lineWrap = value;
    }

    get metadata() {
        return this.info ? this.info.metadata : { };
    }

    set metadata(value) {
        if (_.isObject(value)) this.#metadata = this._structureMetadata(value);
    }

    get multiBar() {
        return this.#multiBar;
    }

    get percentageColorBack() {
        return this.#percentageColorBack;
    }

    set percentageColorBack(value) {
        if (_.isString(value) && !!value.length) this.#percentageColorBack = value.trim();
    }

    get percentageColorFore() {
        return this.#percentageColorFore;
    }

    set percentageColorFore(value) {
        if (_.isString(value) && !!value.length) this.#percentageColorFore = value.trim();
    }

    get percentageColorStyle() {
        return this.#buildColorStyle(this.#percentageColorFormat, this.percentageColorFore, this.percentageColorBack);
    }

    get percentageFormat() {
        return this.#percentageFormat;
    }

    set percentageFormat(value) {
        if (_.isString(value) && !!value.length) this.#percentageFormat = value;
    }

    get postfixFormat() {
        return this.#postfixFormat;
    }

    set postfixFormat(value) {
        if (_.isString(value) && !!value.length) this.#postfixFormat = value;
    }

    get prefix() {
        if (_.isString(this.#prefix) && !!this.#prefix.length) return this.#prefix;
        this.#prefix = this._buildLogMessagePrefix(null, this.metadata, this.colorize);
        return this.#prefix;
    }

    set prefix(value) {
        if (_.isString(value)) this.#prefix = value.trim();
    }

    get progressCalculationRelative() {
        return this.#progressCalculationRelative;
    }

    set progressCalculationRelative(value) {
        if (_.isBoolean(value)) this.#progressCalculationRelative = value;
    }

    get showBar() {
        return this.#showBar;
    }

    set showBar(value) {
        if (_.isBoolean(value)) this.#showBar = value;
    }

    get showDuration() {
        return this.#showDuration;
    }

    set showDuration(value) {
        if (_.isBoolean(value)) this.#showDuration = value;
    }

    get showEta() {
        return this.#showEta;
    }

    set showEta(value) {
        if (_.isBoolean(value)) this.#showEta = value;
    }

    get showPercentage() {
        return this.#showPercentage;
    }

    set showPercentage(value) {
        if (_.isBoolean(value)) this.#showPercentage = value;
    }

    get showPostfix() {
        return this.#showPostfix;
    }

    set showPostfix(value) {
        if (_.isBoolean(value)) this.#showPostfix = value;
    }

    get showPrefix() {
        return this.#showPrefix;
    }

    set showPrefix(value) {
        if (_.isBoolean(value)) this.#showPrefix = value;
    }

    get showTotal() {
        return this.#showTotal;
    }

    set showTotal(value) {
        if (_.isBoolean(value)) this.#showTotal = value;
    }

    get showValue() {
        return this.#showValue;
    }

    set showValue(value) {
        if (_.isBoolean(value)) this.#showValue = value;
    }

    get size() {
        return this.#size;
    }

    set size(value) {
        if (_.isInteger(value) && (value > 0)) this.#size = value;
    }

    get stream() {
        return this.#stream;
    }

    set stream(value) {
        if (_.isObject(value) && (value.write || value.writable)) this.#stream = value;
    }

    get stopOnComplete() {
        return this.#stopOnComplete;
    }

    set stopOnComplete(value) {
        if (_.isBoolean(value)) this.#stopOnComplete = value;
    }

    get totalFormat() {
        return this.#totalFormat;
    }

    set totalFormat(value) {
        if (_.isString(value) && !!value.length) this.#totalFormat = value;
    }

    get valueColorBack() {
        return this.#valueColorBack;
    }

    set valueColorBack(value) {
        if (_.isString(value) && !!value.length) this.#valueColorBack = value.trim();
    }

    get valueColorFore() {
        return this.#valueColorFore;
    }

    set valueColorFore(value) {
        if (_.isString(value) && !!value.length) this.#valueColorFore = value.trim();
    }

    get valueColorStyle() {
        return this.#buildColorStyle(this.#valueColorFormat, this.valueColorFore, this.valueColorBack);
    }

    get valueFormat() {
        return this.#valueFormat;
    }

    set valueFormat(value) {
        if (_.isString(value) && !!value.length) this.#valueFormat = value;
    }

    add(total, startValue = 0, payload = { }, barOptions = { }) {
        barOptions = barOptions || { };
        if (!this.hasMultiBar) {
            this.#multiBar = this.#createMultiBar(barOptions);
        }
        return this.multiBar.create(total, startValue, payload, barOptions);
    }

    #buildColorStyle(format, fore, back) {
        if (!doesEnumInclude(enums.chalkFormats, format) || ((!_.isString(fore) || !fore.length) && (!_.isString(back) || !back.length))) return null;
        return { format, fore, back };
    }

    #buildFormat() {
        const parts = [ ];
        if (this.showPrefix && !!this.prefix) parts.push(this.prefix);
        if (this.showBar) {
            const bar = this.hasBarColor ? chalkTarget(this.barFormat, this.barColorStyle) : this.barFormat;
            parts.push(bar);
        }
        if (this.showPercentage) {
            const percentage = this.hasPercentageColor ? chalkTarget(this.percentageFormat, this.percentageColorStyle) : this.percentageFormat;
            parts.push(percentage);
        }
        if (this.showDuration) {
            const tag = this.durationFormatted ? this.durationFormattedFormat : this.durationFormat;
            const duration = 'Elapsed: ' + (this.hasDurationColor ? chalkTarget(tag, this.durationColorStyle) : tag);
            parts.push(`${ this.formatDelimiter } ${ duration }`);
        }
        if (this.showEta) {
            const tag = this.etaFormatted ? this.etaFormattedFormat : this.etaFormat;
            const eta = 'ETA: ' + (this.hasEtaColor ? chalkTarget(tag, this.etaColorStyle) : tag);
            parts.push(`${ this.formatDelimiter } ${ eta }`);
        }
        if (this.showValue) {
            const valueParts = [ ];
            const value = this.hasValueColor ? chalkTarget(this.valueFormat, this.valueColorStyle) : this.valueFormat;
            valueParts.push(`${ this.formatDelimiter } ${ value }`);
            if (this.showTotal) {
                const total = '/' + (this.hasValueColor ? chalkTarget(this.totalFormat, this.valueColorStyle) : this.totalFormat);
                valueParts.push(total);
            }
            parts.push(valueParts.join(''));
        }
        if (this.showPostfix) parts.push(`${ this.formatDelimiter } ${ this.postfixFormat }`);
        return parts.join(' ').trim();
    }

    #buildMultiBarOptions(options) {
        options = options || { };
        const defaultOptions = {
            fps: this.fps,
            stream: this.stream,
            stopOnComplete: this.stopOnComplete,
            clearOnComplete: this.clearOnComplete,
            barsize: this.size,
            align: this.alignment,
            hideCursor: this.hideCursor,
            linewrap: this.lineWrap,
            gracefulExit: this.gracefulExit,
            etaBuffer: this.etaBuffer,
            progressCalculationRelative: this.progressCalculationRelative,
            emptyOnZero: this.emptyOnZero,
            forceRedraw: this.forceRedraw,
            barGlue: this.glue,
            autopadding: this.autoPadding,
            autopaddingCharacter: this.autoPaddingCharacter,
        };
        if (this.hasFormatBar) defaultOptions.formatBar = this.formatBarFunction;
        if (this.hasFormatTime) defaultOptions.formatTime = this.formatTimeFunction;
        if (this.hasFormatValue) defaultOptions.formatValue = this.formatValueFunction;
        return _.defaults(defaultOptions, options);
    }

    #buildPreset(options) {
        options = options || { };
        const defaultOptions = {
            format: this.format,
            barCompleteChar: this.completeCharacter,
            barIncompleteChar: this.incompleteCharacter,
        };
        return _.defaults(defaultOptions, options);
    }

    #createMultiBar(barOptions) {
        const _barOptions = this.#buildMultiBarOptions(barOptions);
        const _barPreset = this.#buildPreset(barOptions);
        return new MultiBar(_barOptions, _barPreset);
    }

    #isAlignment(value) {
        return doesEnumInclude(enums.progressBarAlignments, value);
    }

    log(...args) {
        if (!this.hasMultiBar) return;
        return this.multiBar.log(...args);
    }

    #processOptions(options) {
        options = options || { };
        this.alignment = options.alignment || options.align;
        this.autoPadding = options.autoPadding;
        this.autoPaddingCharacter = options.autoPaddingCharacter;
        this.barColorBack = options.barColorBack;
        this.barColorFore = options.barColorFore;
        this.barFormat = options.barFormat;
        this.clearOnComplete = options.clearOnComplete;
        this.completeCharacter = options.completeCharacter || options.barCompleteChar;
        this.durationColorBack = options.durationColorBack;
        this.durationColorFore = options.durationColorFore;
        this.durationFormat = options.durationFormat;
        this.durationFormatted = options.durationFormatted;
        this.durationFormattedFormat = options.durationFormattedFormat;
        this.emptyOnZero = options.emptyOnZero;
        this.etaBuffer = options.etaBuffer;
        this.etaColorBack = options.etaColorBack;
        this.etaColorFore = options.etaColorFore;
        this.etaFormat = options.etaFormat;
        this.etaFormatted = options.etaFormatted;
        this.etaFormattedFormat = options.etaFormattedFormat;
        this.forceRedraw = options.forceRedraw;
        this.format = options.format;
        this.formatBarFunction = options.formatBarFunction || options.formatBar;
        this.formatDelimiter = options.formatDelimiter;
        this.formatTimeFunction = options.formatTimeFunction || options.formatTime;
        this.formatValueFunction = options.formatValueFunction || options.formatValue;
        this.fps = options.fps;
        this.glue = options.glue || options.barGlue;
        this.hideCursor = options.hideCursor;
        this.incompleteCharacter = options.incompleteCharacter || options.barIncompleteChar;
        this.lineWrap = options.lineWrap || options.linewrap;
        this.metadata = options.metadata;
        this.percentageColorBack = options.percentageColorBack;
        this.percentageColorFore = options.percentageColorFore;
        this.percentageFormat = options.percentageFormat;
        this.postfixFormat = options.postfixFormat;
        this.prefix = options.prefix;
        this.progressCalculationRelative = options.progressCalculationRelative;
        this.showBar = options.showBar;
        this.showDuration = options.showDuration;
        this.showEta = options.showEta;
        this.showPercentage = options.showPercentage;
        this.showPostfix = options.showPostfix;
        this.showPrefix = options.showPrefix;
        this.showTotal = options.showTotal;
        this.showValue = options.showValue;
        this.size = options.size;
        this.stream = options.stream;
        this.stopOnComplete = options.stopOnComplete;
        this.totalFormat = options.totalFormat;
        this.valueColorBack = options.valueColorBack;
        this.valueColorFore = options.valueColorFore;
        this.valueFormat = options.valueFormat;
        this.#setInfo(options);
    }

    remove(bar) {
        if (!this.hasMultiBar) return;
        return this.multiBar.remove(bar);
    }

    #setInfo(options) {
        options = options || { };
        const label = _.isString(options.label) ? options.label.trim() : this.defaultLabel;
        this.colorize = options.colorize || this.colorize;
        this.label = label;
        this.timestampFormat = options.timestampFormat;
        const id = options.id || null;
        const ip = options.ip || null;
        const user = options.user || null;
        const metadata = { ...options, label };
        this.info = {
            id,
            ip,
            label,
            metadata,
            user,
        };
    }

    stop() {
        if (!this.hasMultiBar) return;
        return this.multiBar.stop();
    }

}

module.exports = ZeddemoreProgressMultibar;
