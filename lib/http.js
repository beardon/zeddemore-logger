// Copyright (c) 2026 by Beardon Services, Inc.

const _ = require('lodash');

function extractHttpStatusCode(message) {
    if (!_.isString(message) || !message.length) return null;
    // Regex breakdown:
    // \b      : Word boundary (ensures we don't grab "12345")
    // [1-5]   : Starts with 1 (Info), 2 (Success), 3 (Redirect), 4 (Client Error), or 5 (Server Error)
    // [0-9]{2}: Followed by exactly two digits
    // \b      : Ending word boundary
    const match = message.match(/\b[1-5][0-9]{2}\b/);
    return match ? +match[ 0 ] : null;
}

function extractHttpVerb(message) {
    if (!_.isString(message) || !message.length) return null;
    const splitMessage = message.split(' ');
    if (splitMessage.length < 2) return null;
    return message.split(' ')[ 0 ];
}

module.exports = {
    extractHttpStatusCode,
    extractHttpVerb,
}
