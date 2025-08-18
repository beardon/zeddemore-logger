// Copyright (c) 2025 by Beardon Services, Inc.

const { logLevelIdToWinstonLogLevelName } = require('./logging');
const ZeddemoreLogger = require('./ZeddemoreLogger');

module.exports = {
    enums: require('./enums'),
    log: ZeddemoreLogger.getLogger,
    logLevelIdToWinstonLogLevelName,
    winstonLogLevelIdToName: logLevelIdToWinstonLogLevelName, // deprecated naming
    writeAxiosErrorLog: ZeddemoreLogger.writeAxiosErrorLog,
    writeAxiosLog: ZeddemoreLogger.writeAxiosResponseLog, // deprecated
    writeAxiosResponseLog: ZeddemoreLogger.writeAxiosResponseLog,
    ZeddemoreLogger,
};
