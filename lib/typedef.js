/** @typedef {Object} app
 * @property {Object} locals
 * @property {ZeddemoreLoggerController|null} locals.logger
 */

/**
 * @typedef {Object|null} Metadata
 * @property {String} [caller]
 * @property {String} [fullId]
 * @property {String} [id]
 * @property {String} [ip]
 * @property {String} [label]
 * @property {String} [prefix]
 * @property {Boolean} [raw]
 * @property {String} [subId]
 * @property {String} [target]
 * @property {String} [timestamp]
 * @property {String} [user]
 */

/**
 * @typedef {Object|null} SequelizeModel
 * @property {Function} [create]
 * @property {Function} [findOne]
 */

/**
 * @typedef {Object} user
 * @property {String} [ipAddress]
 * @property {String} [login]
 * @property {number|String} [logLevel]
 * @property {String} [username]
 */
