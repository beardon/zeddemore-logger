const _ = require('lodash');

function parseIpAddress(ipAddress) {
    const ipChain = (_.isString(ipAddress) && !!ipAddress.trim().length) ? ipAddress.split(',').map((ip) => ip.trim()) : [ ];
    return !!ipChain.length ? ipChain[ 0 ] : null;
}

module.exports = {
    parseIpAddress,
};
