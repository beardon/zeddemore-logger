// Copyright (c) 2024-2025 by Beardon Services, Inc.

const enums = require('./enums');

const { hexColors: hc, morganFormats: mf, morganFormatTokens: mft, winstonLogLevelNames: wlln } = enums;

module.exports = {
    colorConsoleWhiteHex: hc.CONSOLE_WHITE,
    consoleDirExtensionMethodName: 'dirp',
    consoleDirExtensionColors: true,
    consoleDirExtensionDepth: null,
    consoleDirExtensionShowHidden: true,
    consoleTransportName: 'console',
    contentLengthDigits: 2,
    liveMessage: '⚡live⚡',
    morganFormat: mf.ZEDDEMORE,
    morganFormatTokens: [ mft.METHOD, mft.DECODED_URL, mft.STATUS, mft.RESPONSE_TIME_FORMAT, mft.CONTENT_LENGTH_FORMAT ],
    morganFormatTokensColorized: [ mft.METHOD, mft.DECODED_URL, mft.STATUS_COLORED, mft.RESPONSE_TIME_FORMAT, mft.CONTENT_LENGTH_FORMAT ],
    progressBarBarFormat: '{bar}',
    progressBarCompleteCharacter: '█',
    progressBarDelimiter: '|',
    progressBarDurationFormat: '{duration}s',
    progressBarDurationFormattedFormat: '{duration_formatted}',
    progressBarEtaFormat: '{eta}s',
    progressBarEtaFormattedFormat: '{eta_formatted}',
    progressBarIncompleteCharacter: '░',
    progressBarPercentageFormat: '{percentage}%',
    progressBarPostfixFormat: '{postfix}',
    progressBarValueFormat: '{value}',
    progressBarTotalFormat: '{total}',
    requestIdAttribute: 'requestId',
    requestIdIcon: '🧵',
    responseTimeDigits: 0,
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
    userLogLevel: -1,
    winstonLogLevelName: wlln.INFO,
};
