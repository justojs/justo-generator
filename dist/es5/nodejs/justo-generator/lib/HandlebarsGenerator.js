"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _path = require("path");var _path2 = _interopRequireDefault(_path);
var _justoHandlebars = require("justo-handlebars");
var _justoFs = require("justo-fs");var fs = _interopRequireWildcard(_justoFs);
var _Generator2 = require("./Generator");var _Generator3 = _interopRequireDefault(_Generator2);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}


var _template = Symbol();


var hbs = new _justoHandlebars.Handlebars();var




HandlebarsGenerator = function (_Generator) {_inherits(HandlebarsGenerator, _Generator);



  function HandlebarsGenerator() {var _ref;_classCallCheck(this, HandlebarsGenerator);for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}var _this = _possibleConstructorReturn(this, (_ref = HandlebarsGenerator.__proto__ || Object.getPrototypeOf(HandlebarsGenerator)).call.apply(_ref, [this].concat(

    args)));


    _this.registerHelper("include", function (file) {
      return new fs.File(_this.src, file).text;
    });return _this;
  }_createClass(HandlebarsGenerator, [{ key: "template", value: function template(
























    entry) {var _this2 = this;
      var dst, opts, scope, alias;for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {args[_key2 - 1] = arguments[_key2];}


      if (args.length == 1) {
        if (typeof args[0] == "string") alias = args[0];else
        scope = args[0];
      } else if (args.length == 2) {
        if (typeof args[0] == "string") {;alias = args[0];scope = args[1];} else {
          ;scope = args[0];opts = args[1];}
      } else if (args.length >= 3) {
        alias = args[0];scope = args[1];opts = args[2];
      }

      if (!scope) scope = {};
      if (!opts) opts = {};



      dst = new fs.Dir(this.dst, _path2.default.dirname(entry));
      dst.create();
      dst = alias ? new fs.File(this.dst, _path2.default.dirname(entry), alias) : new fs.File(this.dst, entry);


      if (this.mute) this[_template](entry, scope, opts, dst);else
      this.simple(function (params) {return _this2[_template].apply(_this2, _toConsumableArray(params));})("Generate " + new fs.File(dst).replacePath(this.dst + "/"), entry, scope, opts, dst);
    } }, { key:

    _template, value: function value(entry, scope, opts, dst) {
      dst.text = this.templateAsString(entry, scope, opts);
    } }, { key: "templateAsString", value: function templateAsString(




    file, scope, opts) {
      return hbs.renderFile(_path2.default.join(this.src, file), {
        dir: {
          path: process.cwd(),
          name: _path2.default.basename(process.cwd()),
          parent: _path2.default.dirname(process.cwd()) },

        scope: scope },
      opts);
    } }, { key: "registerHelper", value: function registerHelper()







    {
      hbs.registerHelper.apply(hbs, arguments);
    } }, { key: "hasHelper", value: function hasHelper(







    name) {
      return hbs.hasHelper(name);
    } }, { key: "unregisterHelper", value: function unregisterHelper(






    name) {
      hbs.unregisterHelper(name);
    } }, { key: "registerPartial", value: function registerPartial()







    {
      hbs.registerPartial.apply(hbs, arguments);
    } }, { key: "registerPartialFromFile", value: function registerPartialFromFile(







    name, file) {
      this.registerPartial(name, new fs.File(this.src, file).text);
    } }, { key: "registerPartialsFromFolder", value: function registerPartialsFromFolder(








    dir, ns) {

      dir = new fs.Dir(this.src, dir);
      if (!dir.exists()) return;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {


        for (var _iterator = dir.entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var entry = _step.value;
          if (entry instanceof fs.File) {
            this.registerPartial((ns || "") + entry.name.replace(".hbs", ""), entry.text);
          }
        }} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}
    } }, { key: "hasPartial", value: function hasPartial(







    name) {
      return hbs.hasPartial(name);
    } }, { key: "unregisterPartial", value: function unregisterPartial(






    name) {
      hbs.unregisterPartial(name);
    } }]);return HandlebarsGenerator;}(_Generator3.default);exports.default = HandlebarsGenerator;