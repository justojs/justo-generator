"use strict";Object.defineProperty(exports, "__esModule", { value: true });exports.HandlebarsGenerator = exports.Generator = undefined;var _Generator = require("./lib/Generator");Object.defineProperty(exports, "Generator", { enumerable: true, get: function get() {return _interopRequireDefault(_Generator).
















    default;} });var _HandlebarsGenerator = require("./lib/HandlebarsGenerator");Object.defineProperty(exports, "HandlebarsGenerator", { enumerable: true, get: function get() {return _interopRequireDefault(_HandlebarsGenerator).
    default;} });var _justo = require("justo");var _justo2 = _interopRequireDefault(_justo);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}if (!_justo2.default.simple) {_justo2.default.initialize({ runner: { main: undefined, onError: "continue", logger: { minLevel: "info", maxLevel: "fatal" } } });}