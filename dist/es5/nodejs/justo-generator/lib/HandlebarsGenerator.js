"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _path = require("path");var _path2 = _interopRequireDefault(_path);var _handlebars = require("handlebars");var 

hbs = _interopRequireWildcard(_handlebars);var _justoFs = require("justo-fs");var 
fs = _interopRequireWildcard(_justoFs);var _Generator2 = require("./Generator");var _Generator3 = _interopRequireDefault(_Generator2);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var 





HandlebarsGenerator = function (_Generator) {_inherits(HandlebarsGenerator, _Generator);



  function HandlebarsGenerator() {var _Object$getPrototypeO;for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}_classCallCheck(this, HandlebarsGenerator);var _this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(HandlebarsGenerator)).call.apply(_Object$getPrototypeO, [this].concat(

    args)));


    _this.registerHelper("eq", function (x, y) {
      return x == y;});


    _this.registerHelper("ne", function (x, y) {
      return x != y;});


    _this.registerHelper("lt", function (x, y) {
      return x < y;});


    _this.registerHelper("le", function (x, y) {
      return x <= y;});


    _this.registerHelper("gt", function (x, y) {
      return x > y;});


    _this.registerHelper("ge", function (x, y) {
      return x >= y;});


    _this.registerHelper("in", function (value, coll) {
      return coll.indexOf(value) >= 0;});


    _this.registerHelper("nin", function (value, coll) {
      return coll.indexOf(value) < 0;});


    _this.registerHelper("iif", function (cond, tr, fls) {
      return cond ? tr : fls;});


    _this.registerHelper("coalesce", function (args) {
      var res;var _iteratorNormalCompletion = true;var _didIteratorError = false;var _iteratorError = undefined;try {


        for (var _iterator = args[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {var arg = _step.value;
          if (arg !== undefined && arg !== null) {
            res = arg;
            break;}}} catch (err) {_didIteratorError = true;_iteratorError = err;} finally {try {if (!_iteratorNormalCompletion && _iterator.return) {_iterator.return();}} finally {if (_didIteratorError) {throw _iteratorError;}}}




      return res;});


    _this.registerHelper("include", function (file) {
      return new fs.File(_this.src, file).text;});return _this;}_createClass(HandlebarsGenerator, [{ key: "template", value: function template(


























    entry) {
      var src, dst, tmp, opts, scope, alias;for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {args[_key2 - 1] = arguments[_key2];}


      if (args.length == 1) {
        if (typeof args[0] == "string") alias = args[0];else 
        scope = args[0];} else 
      if (args.length == 2) {
        if (typeof args[0] == "string") {;alias = args[0];scope = args[1];} else {
          ;scope = args[0];opts = args[1];}} else 
      if (args.length >= 3) {
        alias = args[0];scope = args[1];opts = args[2];}


      if (!scope) scope = {};
      if (!opts) opts = {};


      src = new fs.File(this.base, entry);
      if (!src.exists()) throw new Error("The '" + src.path + "' file doesn't exist.");



      dst = new fs.Dir(this.dst, _path2.default.dirname(entry));
      dst.create();
      dst = alias ? new fs.File(this.dst, _path2.default.dirname(entry), alias) : new fs.File(this.dst, entry);


      if (opts.helpers) {
        for (var hlpr in opts.helpers) {this.registerHelper(hlpr, opts.helpers[hlpr]);}}


      if (opts.partials) {
        for (var prtl in opts.partials) {this.registerPartial(prtl, opts.partials[prtl]);}}



      tmp = hbs.compile(src.text, opts);

      dst.text = tmp({ 
        dir: { 
          path: process.cwd(), 
          name: _path2.default.basename(process.cwd()), 
          parent: _path2.default.dirname(process.cwd()) }, 

        scope: scope });



      if (opts.helpers) {
        for (var hlpr in opts.helpers) {this.unregisterHelper(hlpr);}}


      if (opts.partials) {
        for (var prtl in opts.partials) {this.unregisterPartial(prtl);}}} }, { key: "registerHelper", value: function registerHelper() 









    {
      hbs.registerHelper.apply(hbs, arguments);} }, { key: "hasHelper", value: function hasHelper(








    name) {
      return !!hbs.helpers[name];} }, { key: "unregisterHelper", value: function unregisterHelper(







    name) {
      hbs.unregisterHelper(name);} }, { key: "registerPartial", value: function registerPartial() 








    {
      hbs.registerPartial.apply(hbs, arguments);} }, { key: "registerPartialFromFile", value: function registerPartialFromFile(








    name, file) {
      this.registerPartial(name, new fs.File(this.src, file).text);} }, { key: "hasPartial", value: function hasPartial(








    name) {
      return !!hbs.partials[name];} }, { key: "unregisterPartial", value: function unregisterPartial(







    name) {
      hbs.unregisterPartial(name);} }]);return HandlebarsGenerator;}(_Generator3.default);exports.default = HandlebarsGenerator;
