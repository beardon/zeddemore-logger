// Copyright (c) 2025-2026 by Beardon Services, Inc.

const _ = require('lodash');
const sizeof = require('object-sizeof');

function convertBytes(bytes, options = { }) {
    options = options || { };
    if (!_.isNumber(bytes)) return null;
    const useBinaryUnits = _.isBoolean(options.useBinaryUnits) ? options.useBinaryUnits : false;
    const decimals = _.isInteger(options.decimals) ? options.decimals : 2;
    const spaced = _.isBoolean(options.spaced) ? options.spaced : false;
    const base = useBinaryUnits ? 1024 : 1000;
    const units = useBinaryUnits
        ? [ 'B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB' ]
        : [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
    let i = Math.floor(Math.log(bytes) / Math.log(base));
    if (!_.isSafeInteger(i)) i = 0;
    let size = (bytes / Math.pow(base, i)).toFixed(decimals);
    if (_.isNaN(size)) size = 0;
    return `${ size }${ spaced ? ' ' : '' }${ units[ i ] }`;
}

function objectBytes(object) {
    return !_.isNull(object) ? sizeof(object) : 0;
}

function round(value, decimals = 2) {
    if (!_.isNumber(value)) return value;
    const rounder = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * rounder) / rounder;
}

module.exports = {
    convertBytes,
    objectBytes,
    round,
};
