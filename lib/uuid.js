// Copyright (c) 2025 by Beardon Services, Inc.

const { v4: uuid } = require('uuid');

function generateUuid() {
    return uuid(null, null, null);
}

module.exports = {
    generateUuid,
};
