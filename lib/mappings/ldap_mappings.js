// Copyright (c) 2026 by Beardon Services, Inc.

const enums = require('../enums');

const { ldapOperations: lo, ldapRequestOperationTypes: lrot } = enums;

const ldapRequestOperationMap = [
    { operation: lo.ABANDON, type: lrot.ABANDON },
    { operation: lo.ADD, type: lrot.ADD },
    { operation: lo.BIND, type: lrot.BIND },
    { operation: lo.COMPARE, type: lrot.COMPARE },
    { operation: lo.DELETE, type: lrot.DELETE },
    { operation: lo.EXTENDED, type: lrot.EXTENDED },
    { operation: lo.MODIFY, type: lrot.MODIFY },
    { operation: lo.MODIFY_DN, type: lrot.MODIFY_DN },
    { operation: lo.SEARCH, type: lrot.SEARCH },
    { operation: lo.UNBIND, type: lrot.UNBIND },
];

module.exports = {
    ldapRequestOperationMap,
};
