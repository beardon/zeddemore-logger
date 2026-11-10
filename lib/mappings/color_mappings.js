// Copyright (c) 2024-2026 by Beardon Services, Inc.

const _ = require('lodash');
const enums = require('../enums');

const { ansiColors: ac, chalkFormats: cf, hexColors: hc, httpMethods: http, ldapOperations: lo, winstonLogLevelNames: wlln } = enums;

const httpStatusColors = [
    { range: _.range(500, 600), style: { format: cf.ANSI, fore: ac.HTTP_SERVER_ERROR, back: null } },
    { range: _.range(400, 500), style: { format: cf.ANSI, fore: ac.HTTP_CLIENT_ERROR, back: null } },
    { range: _.range(300, 400), style: { format: cf.ANSI, fore: ac.HTTP_REDIRECTION, back: null } },
    { range: _.range(200, 300), style: { format: cf.ANSI, fore: ac.HTTP_SUCCESSFUL, back: null } },
    { range: _.range(100, 200), style: { format: cf.ANSI, fore: ac.HTTP_INFORMATIONAL, back: null } },
];

const httpVerbColors = [
    { match: http.CONNECT, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_CONNECT } },
    { match: http.DELETE, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_DELETE } },
    { match: http.GET, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_GET } },
    { match: http.HEAD, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_HEAD } },
    { match: http.OPTIONS, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_OPTIONS } },
    { match: http.PATCH, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_PATCH } },
    { match: http.POST, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_POST } },
    { match: http.PUT, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_PUT } },
    { match: http.TRACE, style: { format: cf.HEX, fore: hc.BLACK, back: hc.HTTP_TRACE } },
];

const ldapStatusColors = [
    { range: _.range(1, 999), style: { format: cf.ANSI, fore: ac.LDAP_ERROR, back: null } },
    { range: [ 0 ], style: { format: cf.ANSI, fore: ac.LDAP_SUCCESSFUL, back: null } },
];

const ldapOperationColors = [
    { match: lo.ABANDON, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_ABANDON } },
    { match: lo.ADD, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_ADD } },
    { match: lo.BIND, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_BIND } },
    { match: lo.COMPARE, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_COMPARE } },
    { match: lo.DELETE, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_DELETE } },
    { match: lo.EXTENDED, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_EXTENDED } },
    { match: lo.MODIFY, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_MODIFY } },
    { match: lo.MODIFY_DN, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_MODIFY_DN } },
    { match: lo.SEARCH, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_SEARCH } },
    { match: lo.UNBIND, style: { format: cf.HEX, fore: hc.BLACK, back: hc.LDAP_UNBIND } },
];

const logLevelColors = [
    { match: wlln.ERROR, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_ERROR, back: null } },
    { match: wlln.WARNING, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_WARNING, back: null } },
    { match: wlln.INFO, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_INFO, back: null } },
    { match: wlln.HTTP, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_HTTP, back: null } },
    { match: wlln.VERBOSE, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_VERBOSE, back: null } },
    { match: wlln.DEBUG, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_DEBUG, back: null } },
    { match: wlln.SILLY, style: { format: cf.ANSI, fore: ac.LOG_LEVEL_SILLY, back: null } },
];

const packageColors = [
    { match: 'AngularJS', style: { format: cf.HEX, fore: hc.PACKAGE_ANGULARJS, back: null } },
    { match: 'Apple', style: { format: cf.HEX, fore: hc.PACKAGE_APPLE, back: null } },
    { match: 'apple', style: { format: cf.HEX, fore: hc.PACKAGE_APPLE, back: null }, matchPartial: true },
    { match: 'Archiver', style: { format: cf.HEX, fore: hc.PACKAGE_ARCHIVER, back: null } },
    { match: 'AvaTax', style: { format: cf.HEX, fore: hc.PACKAGE_AVATAX, back: null } },
    { match: 'Axios', style: { format: cf.HEX, fore: hc.PACKAGE_AXIOS, back: null } },
    { match: 'Bcrypt', style: { format: cf.HEX, fore: hc.PACKAGE_BCRYPT, back: null } },
    { match: 'Chalk', style: { format: cf.HEX, fore: hc.PACKAGE_CHALK, back: null } },
    { match: 'CORS', style: { format: cf.HEX, fore: hc.PACKAGE_CORS, back: null } },
    { match: 'cron', style: { format: cf.HEX, fore: hc.PACKAGE_CRON, back: null } },
    { match: 'csv-parse', style: { format: cf.HEX, fore: hc.PACKAGE_CSVPARSE, back: null } },
    { match: 'CSVTOJSON', style: { format: cf.HEX, fore: hc.PACKAGE_CSVTOJSON, back: null } },
    { match: 'express', style: { format: cf.HEX, fore: hc.PACKAGE_EXPRESS, back: null } },
    { match: 'FontAwesome', style: { format: cf.HEX, fore: hc.PACKAGE_FONTAWESOME, back: null } },
    { match: 'Fuse.js', style: { format: cf.HEX, fore: hc.PACKAGE_FUSEJS, back: null } },
    { match: 'Glob', style: { format: cf.HEX, fore: hc.PACKAGE_GLOB, back: null } },
    { match: 'Google', style: { format: cf.HEX, fore: hc.PACKAGE_GOOGLE, back: null } },
    { match: 'googleapis', style: { format: cf.HEX, fore: hc.PACKAGE_GOOGLE, back: null } },
    { match: 'google-cloud', style: { format: cf.HEX, fore: hc.PACKAGE_GOOGLE, back: null }, matchPartial: true },
    { match: 'Handlebars', style: { format: cf.HEX, fore: hc.PACKAGE_HANDLEBARS, back: null } },
    { match: 'Helmet', style: { format: cf.HEX, fore: hc.PACKAGE_HELMET, back: null } },
    { match: 'Jimp', style: { format: cf.HEX, fore: hc.PACKAGE_JIMP, back: null } },
    { match: 'jsonwebtoken', style: { format: cf.HEX, fore: hc.PACKAGE_JSONWEBTOKEN, back: null } },
    { match: 'ldapjs', style: { format: cf.HEX, fore: hc.PACKAGE_LDAPJS, back: null } },
    { match: 'lderp', style: { format: cf.HEX, fore: hc.PACKAGE_LDERP, back: null } },
    { match: 'Lodash', style: { format: cf.HEX, fore: hc.PACKAGE_LODASH, back: null } },
    { match: 'Luxon', style: { format: cf.HEX, fore: hc.PACKAGE_LUXON, back: null } },
    { match: 'MariaDB', style: { format: cf.HEX, fore: hc.PACKAGE_MARIADB, back: null } },
    { match: 'MaxMind', style: { format: cf.HEX, fore: hc.PACKAGE_MAXMIND, back: null } },
    { match: 'maxmind', style: { format: cf.HEX, fore: hc.PACKAGE_MAXMIND, back: null }, matchPartial: true },
    { match: 'Melissa', style: { format: cf.HEX, fore: hc.PACKAGE_MELISSA, back: null } },
    { match: 'Multer', style: { format: cf.HEX, fore: hc.PACKAGE_MULTER, back: null } },
    { match: 'MySQL', style: { format: cf.HEX, fore: hc.PACKAGE_MYSQL, back: null } },
    { match: 'Node.js', style: { format: cf.HEX, fore: hc.PACKAGE_NODE_JS, back: null } },
    { match: 'Nodemailer', style: { format: cf.HEX, fore: hc.PACKAGE_NODEMAILER, back: null } },
    { match: 'PapaParse', style: { format: cf.HEX, fore: hc.PACKAGE_PAPAPARSE, back: null } },
    { match: 'passport', style: { format: cf.HEX, fore: hc.PACKAGE_PASSPORT, back: null } },
    { match: 'PDFKit', style: { format: cf.HEX, fore: hc.PACKAGE_PDFKIT, back: null } },
    { match: 'PDF-LIB', style: { format: cf.HEX, fore: hc.PACKAGE_PDFLIB, back: null } },
    { match: 'PostgreSQL', style: { format: cf.HEX, fore: hc.PACKAGE_POSTGRESQL, back: null } },
    { match: 'Puppeteer', style: { format: cf.HEX, fore: hc.PACKAGE_PUPPETEER, back: null } },
    { match: 'Redis', style: { format: cf.HEX, fore: hc.PACKAGE_REDIS, back: null } },
    { match: 'sequelize', style: { format: cf.HEX, fore: hc.PACKAGE_SEQUELIZE, back: null } },
    { match: 'sharp', style: { format: cf.HEX, fore: hc.PACKAGE_SHARP, back: null } },
    { match: 'Tar', style: { format: cf.HEX, fore: hc.PACKAGE_TAR, back: null } },
    { match: 'Twilio', style: { format: cf.HEX, fore: hc.PACKAGE_TWILIO, back: null } },
    { match: 'WooCommerce', style: { format: cf.HEX, fore: hc.PACKAGE_WOOCOMMERCE, back: null } },
    { match: 'woocommerce', style: { format: cf.HEX, fore: hc.PACKAGE_WOOCOMMERCE, back: null }, matchPartial: true },
    { match: 'XLSX', style: { format: cf.HEX, fore: hc.PACKAGE_XLSX, back: null } },
    { match: 'xml2js', style: { format: cf.HEX, fore: hc.PACKAGE_XML2JS, back: null } },
    { match: 'xmlbuilder', style: { format: cf.HEX, fore: hc.PACKAGE_XMLBUILDER, back: null } },
    { match: 'Zeddemore', style: { format: cf.HEX, fore: hc.PACKAGE_ZEDDEMORE, back: null } },
];

module.exports = {
    httpStatusColors,
    httpVerbColors,
    ldapOperationColors,
    ldapStatusColors,
    logLevelColors,
    packageColors,
};
