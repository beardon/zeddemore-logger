// Copyright (c) 2025-2026 by Beardon Services, Inc.

const { winstonLogLevelIdName } = require('./logging');
const ZeddemoreLogger = require('./ZeddemoreLogger');

module.exports = {
    enums: require('./enums'),
    log: ZeddemoreLogger.getLogger,
    logLevelIdToWinstonLogLevelName: winstonLogLevelIdName, // deprecated naming
    winstonLogLevelIdName,
    winstonLogLevelIdToName: winstonLogLevelIdName, // deprecated naming
    writeAxiosErrorLog: ZeddemoreLogger.writeAxiosErrorLog,
    writeAxiosLog: ZeddemoreLogger.writeAxiosResponseLog, // deprecated
    writeAxiosResponseLog: ZeddemoreLogger.writeAxiosResponseLog,
    ZeddemoreLogger,
};
