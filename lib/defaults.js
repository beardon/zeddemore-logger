// Copyright (c) 2024-2026 by Beardon Services, Inc.

const enums = require('./enums');

const { hexColors: hc, logLevelTypes: llt, morganFormats: mf, morganFormatTokens: mft, winstonFormats: wf,
    winstonLogLevelNames: wlln, winstonTransports: wt } = enums;

module.exports = {
    address: '::',
    addressIPv6Sentinel: ':',
    colorConsoleWhiteHex: hc.CONSOLE_WHITE,
    consoleDirExtensionMethodName: 'dirp',
    consoleDirExtensionColors: true,
    consoleDirExtensionDepth: null,
    consoleDirExtensionShowHidden: true,
    contentLengthDigits: 2,
    liveMessage: 'live',
    logLevelType: llt.CONSOLE,
    morganFormat: mf.ZEDDEMORE,
    morganFormatTokens: [ mft.METHOD, mft.DECODED_URL, mft.STATUS, mft.RESPONSE_TIME_FORMAT, mft.CONTENT_LENGTH_FORMAT ],
    morganFormatTokensColorized: [ mft.METHOD, mft.DECODED_URL, mft.STATUS_COLORED, mft.RESPONSE_TIME_FORMAT, mft.CONTENT_LENGTH_FORMAT ],
    requestIdAttribute: 'requestId',
    requestIdIcon: '🧵',
    responseTimeDigits: 0,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
    userLogLevel: -1,
    winstonFormats: [ wf.ZEDDEMORE_INFO_MUTATION, wf.COLORIZE, wf.ZEDDEMORE_LABEL, wf.ZEDDEMORE_TIMESTAMP, wf.METADATA, wf.ZEDDEMORE_PRINTF ],
    winstonTransports: [ wt.CONSOLE, wt.EMAIL ],
    winstonLogLevelName: wlln.INFO,
};
