// Copyright (c) 2025 by Beardon Services, Inc.

const enums = require('../enums');

const { apiLogLevels: all, apiLogLevelCaptions: allc, winstonLogLevelNames: wlln, winstonLogLevels: wll } = enums;

const logLevelMap = [
    { apiLevel: all.DEFAULT, winstonLevel: null, winstonName: null, caption: allc.DEFAULT },
    { apiLevel: all.ERROR, winstonLevel: wll.ERROR, winstonName: wlln.ERROR, caption: allc.ERROR },
    { apiLevel: all.WARNING, winstonLevel: wll.WARNING, winstonName: wlln.WARNING, caption: allc.WARNING },
    { apiLevel: all.INFO, winstonLevel: wll.INFO, winstonName: wlln.INFO, caption: allc.INFO },
    { apiLevel: all.HTTP, winstonLevel: wll.HTTP, winstonName: wlln.HTTP, caption: allc.HTTP },
    { apiLevel: all.VERBOSE, winstonLevel: wll.VERBOSE, winstonName: wlln.VERBOSE, caption: allc.VERBOSE },
    { apiLevel: all.DEBUG, winstonLevel: wll.DEBUG, winstonName: wlln.DEBUG, caption: allc.DEBUG },
    { apiLevel: all.SILLY, winstonLevel: wll.SILLY, winstonName: wlln.SILLY, caption: allc.SILLY },
];

module.exports = {
    logLevelMap,
};
