// Copyright (c) 2025-2026 by Beardon Services, Inc.

const _ = require('lodash');
const { DateTime } = require('luxon');

function convertFechaDateFormatToLuxon(dateFormat) {
    const tokenMappings = [
        { fecha: 'YYYY', luxon: 'yyyy' },
        { fecha: 'YY', luxon: 'yy' },
        { fecha: 'MMMM', luxon: 'LLLL' },
        { fecha: 'MMM', luxon: 'LLL' },
        { fecha: 'MM', luxon: 'LL' },
        { fecha: 'M', luxon: 'L' },
        { fecha: 'dddd', luxon: 'cccc' },
        { fecha: 'ddd', luxon: 'ccc' },
        { fecha: 'DD', luxon: 'dd' },
        { fecha: 'D', luxon: 'd' },
        { fecha: 'SS', luxon: 'SSS' },
    ];
    if (!_.isString(dateFormat)) return null;
    let _dateFormat = dateFormat.trim();
    for (const tokenMapping of tokenMappings) {
        _dateFormat = _dateFormat.replaceAll(tokenMapping.fecha, tokenMapping.luxon);
    }
    return _dateFormat;
}

function convertMilliseconds(milliseconds, options) {
    options = options || { };
    const digits = _.isInteger(options.digits) ? options.digits : 2;
    const spaced = _.isBoolean(options.spaced) ? options.spaced : false;
    let value = milliseconds || 0;
    let unit = 'ms';
    if (milliseconds) {
        const seconds = milliseconds / 1000;
        if (seconds >= 1) {
            value = seconds;
            unit = 's';
            const minutes = seconds / 60;
            if (minutes >= 1) {
                value = minutes;
                unit = 'm';
                const hours = minutes / 60;
                if (hours >= 1) {
                    value = hours;
                    unit = 'h';
                    const days = hours / 24;
                    if (days >= 1) {
                        value = days;
                        unit = 'd';
                        const weeks = days / 7;
                        if (weeks >= 1) {
                            value = weeks;
                            unit = 'w';
                            const months = days / 30;
                            if (months >= 1) {
                                value = months;
                                unit = 'M';
                                const years = days / 365;
                                if (years >= 1) {
                                    value = years;
                                    unit = 'y';
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return `${ value.toFixed(digits) }${ spaced ? ' ' : '' }${ unit }`;
}

function durationMs(startDate, endDate = DateTime.now()) {
    const luxonStartDate = ldapJsDateToLuxon(startDate);
    const luxonEndDate = ldapJsDateToLuxon(endDate);
    if (_.isNull(luxonStartDate) || _.isNull(luxonEndDate)) return null;
    return luxonEndDate.diff(luxonStartDate, 'milliseconds').milliseconds;
}

function durationConverted(startDate, endDate = DateTime.now(), options) {
    endDate = (_.isObject(endDate) && endDate.isValid) ? endDate : DateTime.now();
    const ms = durationMs(startDate, endDate);
    if (!_.isInteger(ms)) return null;
    return convertMilliseconds(ms, options)
}

function ldapJsDateToLuxon(date) {
    if (!date) return null;
    if (_.isObject(date) && date.isValid) return date;
    let luxonDate = DateTime.fromMillis(date);
    return (_.isObject(luxonDate) && luxonDate.isValid) ? luxonDate : null;
}

module.exports = {
    convertFechaDateFormatToLuxon,
    convertMilliseconds,
    durationConverted,
};
