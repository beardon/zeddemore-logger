// Copyright (c) 2025 by Beardon Services, Inc.

const _ = require('lodash');

function convertBytes(bytes, options = { }) {
    options = options || { };
    if (!bytes) return null;
    const useBinaryUnits = options.useBinaryUnits || false;
    const decimals = options.decimals || 2;
    const spaced = options.hasOwnProperty('spaced') ? options.spaced : false;
    const base = useBinaryUnits ? 1024 : 1000;
    const units = useBinaryUnits
        ? [ 'B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB' ]
        : [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];
    const i = Math.floor(Math.log(bytes) / Math.log(base));
    const size = (bytes / Math.pow(base, i)).toFixed(decimals);
    return `${ size }${ spaced ? ' ' : '' }${ units[ i ] }`;
}

function round(value, decimals = 2) {
    if (!_.isNumber(value)) return value;
    const rounder = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * rounder) / rounder;
}

module.exports = {
    convertBytes,
    round,
};
