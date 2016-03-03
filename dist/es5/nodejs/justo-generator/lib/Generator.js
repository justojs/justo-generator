"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _path = require("path");var _path2 = _interopRequireDefault(_path);var _justoInquirer = require("justo-inquirer");var _justoFs = require("justo-fs");var 


fs = _interopRequireWildcard(_justoFs);var _handlebars = require("handlebars");var 
hbs = _interopRequireWildcard(_handlebars);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}


var inquirer = new _justoInquirer.Inquirer();var 









Generator = function () {



  function Generator() {var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];var responses = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];_classCallCheck(this, Generator);

    if (!opts) throw new Error("Generator options expected.");


    Object.defineProperty(this, "name", { enumerable: true, value: opts.name || "unknown" });
    Object.defineProperty(this, "responses", { enumerable: false, value: responses || {} });
    Object.defineProperty(this, "answers", { enumerable: false, writable: true, value: {} });
    Object.defineProperty(this, "src", { enumerable: false, writable: true, value: opts.src });
    Object.defineProperty(this, "dst", { enumerable: false, writable: true, value: opts.dst || process.cwd() });}_createClass(Generator, [{ key: "init", value: function init() 





















    {} }, { key: "fin", value: function fin() 






    {} }, { key: "prompt", value: function prompt(








    answers) {} }, { key: "generate", value: function generate(








    answers) {} }, { key: "run", value: function run() 






    {
      this.answers = Object.assign({}, this.responses);
      this.init();
      this.prompt(this.answers);
      this.generate(this.answers);
      this.fin();} }, { key: "confirm", value: function confirm(









    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) res = [true, "true", "yes"].indexOf(this.responses[q.name]) >= 0;else 
      res = inquirer.confirm(q);

      this.answers[q.name] = res;


      return res;} }, { key: "input", value: function input(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.input(q);

      this.answers[q.name] = res;


      return res;} }, { key: "password", value: function password(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.password(q);

      this.answers[q.name] = res;


      return res;} }, { key: "checkbox", value: function checkbox(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.checkbox(q);

      this.answers[q.name] = res;


      return res;} }, { key: "list", value: function list(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.list(q);

      this.answers[q.name] = res;


      return res;} }, { key: "copy", value: function copy(












    src, name) {
      var entry, dst;


      entry = _path2.default.join(this.base, src);

      if (!fs.exists(entry)) {
        throw new Error("The '" + entry + "' file/dir doesn't exist.");}



      if (name) {
        fs.copy(entry, _path2.default.join(this.dst, _path2.default.dirname(src), name));} else 
      {
        fs.copy(entry, _path2.default.join(this.dst, src));}} }, { key: "copyIf", value: function copyIf(






    cond) {for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
      if (isTrue(cond)) this.copy.apply(this, args);} }, { key: "template", value: function template(














    entry) {
      var src, dst, tmp, scope, alias;for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {args[_key2 - 1] = arguments[_key2];}


      if (args.length == 1) {
        if (typeof args[0] == "string") alias = args[0];else 
        scope = args[0];} else 
      if (args.length >= 2) {
        alias = args[0];scope = args[1];}


      if (!scope) scope = {};


      src = new fs.File(this.base, entry);
      if (!src.exists()) throw new Error("The '" + src.path + "' file doesn't exist.");


      dst = new fs.Dir(this.dst, _path2.default.dirname(entry));
      dst.create();
      dst = alias ? new fs.File(this.dst, _path2.default.dirname(entry), alias) : new fs.File(this.dst, entry);

      tmp = hbs.compile(src.text);
      dst.text = tmp({ 
        dir: { 
          path: process.cwd(), 
          name: _path2.default.basename(process.cwd()), 
          parent: _path2.default.dirname(process.cwd()) }, 

        scope: scope });} }, { key: "templateIf", value: function templateIf(






    cond) {for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {args[_key3 - 1] = arguments[_key3];}
      if (isTrue(cond)) this.template.apply(this, args);} }, { key: "mkdir", value: function mkdir(







    path) {
      var dir = new fs.Dir(this.dst, path);

      if (!dir.exists()) {
        if (!dir.create()) {
          throw new Error("The '" + dir.path + "' directory hasn't been able to be created.");}}} }, { key: "base", get: function get() {return this.src;} }, { key: "help", get: function get() {return {};} }]);return Generator;}();exports.default = Generator;











function isTrue(cond) {
  return [true, "true", "yes"].indexOf(cond) >= 0;}
