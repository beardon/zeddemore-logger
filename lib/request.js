// Copyright (c) 2025-2026 by Beardon Services, Inc.

const _ = require('lodash');

const enums = require('./enums');
const { parseIpAddress } = require('./ip_address');

const { httpRequestHeaders: rqh } = enums;

function extractToken(req) {
    let token;
    const authHeader = req.header(rqh.AUTHORIZATION);
    if (authHeader && authHeader.startsWith(`${ rqh.BEARER_PREFIX } `)) {
        token = req.header(rqh.AUTHORIZATION).split(' ')[ 1 ];
    } else if (req.query && req.query.token) {
        token = req.query.token;
    }
    return token;
}

function getRequestResponseTime(req, res) {
    if (!req._startAt || !res._startAt) return null;
    return (res._startAt[ 0 ] - req._startAt[ 0 ]) * 1e3 + (res._startAt[ 1 ] - req._startAt[ 1 ]) * 1e-6;
}

function isRequestOfMethod(req, method) {
    const methods = Array.isArray(method) ? method : [ method ];
    if (!req || !req.method || _.isEmpty(methods)) return false;
    return methods.includes(req.method);
}

function parseRequest(req) {
    if (!req) return { };
    const body = req.body || { };
    return {
        acceptLanguage: parseRequestAcceptLanguage(req),
        client: body.client || null,
        clientVersion: body.applicationVersion || null,
        ipAddress: parseRequestIpAddress(req),
        sessionAge: body.uptime || 0,
        sessionId: body.sessionId || null,
        userAgent: parseRequestUserAgent(req),
    };
}

function parseRequestAcceptLanguage(req) {
    const body = req.body || { };
    return body.language || req.header(rqh.ACCEPT_LANGUAGE);
}

function parseRequestIpAddress(req) {
    const LOCALHOST_IPS = [ '127.0.0.1', '::1' ];
    const body = req.body || { };
    const requestIpAddress = parseIpAddress(body.ipAddress) || parseIpAddress(req.get(rqh.FORWARDED_FOR)) || parseIpAddress(req.socket.remoteAddress);
    return LOCALHOST_IPS.includes(requestIpAddress) ? 'localhost' : requestIpAddress;
}

function parseRequestUserAgent(req) {
    const body = req.body || { };
    return body.agent || body.osVersion || req.get(rqh.USER_AGENT);
}

module.exports = {
    extractToken,
    getRequestResponseTime,
    isRequestOfMethod,
    parseRequest,
};
