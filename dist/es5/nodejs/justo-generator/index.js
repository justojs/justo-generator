"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.HandlebarsGenerator = exports.Generator = undefined;var _Generator = require("./lib/Generator");Object.defineProperty(exports, "Generator", { enumerable: true, get: function get() {return _interopRequireDefault(_Generator).
















    default;} });var _HandlebarsGenerator = require("./lib/HandlebarsGenerator");Object.defineProperty(exports, "HandlebarsGenerator", { enumerable: true, get: function get() {return _interopRequireDefault(_HandlebarsGenerator).
    default;} });var _justo = require("justo");var justo = _interopRequireWildcard(_justo);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}if (!justo.simple) {justo.initiate({ runner: { main: undefined, onError: "continue", logger: { minLevel: "info", maxLevel: "fatal" } } });}