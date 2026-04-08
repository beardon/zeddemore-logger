// Copyright (c) 2025 by Beardon Services, Inc.

const enums = require('../enums');

const { logLevelTypes: llt, winstonLogLevelNames: wlln, winstonLogLevels: wll, winstonTransports: wt,
    zeddemoreLogLevelCaptions: zllc } = enums;

const logLevelMap = [
    { winstonLevel: null, winstonName: null, caption: zllc.DEFAULT },
    { winstonLevel: wll.ERROR, winstonName: wlln.ERROR, caption: zllc.ERROR },
    { winstonLevel: wll.WARNING, winstonName: wlln.WARNING, caption: zllc.WARNING },
    { winstonLevel: wll.INFO, winstonName: wlln.INFO, caption: zllc.INFO },
    { winstonLevel: wll.HTTP, winstonName: wlln.HTTP, caption: zllc.HTTP },
    { winstonLevel: wll.VERBOSE, winstonName: wlln.VERBOSE, caption: zllc.VERBOSE },
    { winstonLevel: wll.DEBUG, winstonName: wlln.DEBUG, caption: zllc.DEBUG },
    { winstonLevel: wll.SILLY, winstonName: wlln.SILLY, caption: zllc.SILLY },
];

const transportMap = [
    { transport: wt.CONSOLE, type: llt.CONSOLE },
    { transport: wt.EMAIL, type: llt.EMAIL },
];

module.exports = {
    logLevelMap,
    transportMap,
};
