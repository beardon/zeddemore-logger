// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');

function convertMilliseconds(milliseconds, options) {
    options = options || { };
    const digits = _.isInteger(options.digits) ? options.digits : 3;
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

module.exports = {
    convertMilliseconds,
};
