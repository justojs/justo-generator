"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _path = require("path");var _path2 = _interopRequireDefault(_path);
var _child_process = require("child_process");var _child_process2 = _interopRequireDefault(_child_process);
var _justoInquirer = require("justo-inquirer");
var _justoFs = require("justo-fs");var fs = _interopRequireWildcard(_justoFs);
var _justo = require("justo");var _justo2 = _interopRequireDefault(_justo);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _toConsumableArray(arr) {if (Array.isArray(arr)) {for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {arr2[i] = arr[i];}return arr2;} else {return Array.from(arr);}}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}


var _copy = Symbol();
var _cli = Symbol();
var _mkdir = Symbol();
var _remove = Symbol();
var generate = Symbol();
var _append = Symbol();


var inquirer = new _justoInquirer.Inquirer();var 









Generator = function () {



  function Generator() {var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];var responses = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];_classCallCheck(this, Generator);

    if (!opts) throw new Error("Generator options expected.");


    Object.defineProperty(this, "name", { enumerable: true, value: opts.name || "unknown" });
    Object.defineProperty(this, "responses", { enumerable: false, value: responses || {} });
    Object.defineProperty(this, "answers", { enumerable: false, writable: true, value: {} });
    Object.defineProperty(this, "src", { enumerable: false, writable: true, value: opts.src });
    Object.defineProperty(this, "dst", { enumerable: false, writable: true, value: opts.dst || process.cwd() });
    Object.defineProperty(this, "mute", { enumerable: false, value: !!opts.mute });
    Object.defineProperty(this, "simple", { enumerable: false, value: opts.simple || _justo2.default.simple });}_createClass(Generator, [{ key: "init", value: function init() 







































    {} }, { key: "fin", value: function fin() 






    {} }, { key: "prompt", value: function prompt(








    answers) {} }, { key: "pregenerate", value: function pregenerate(








    answers) {} }, { key: "generate", value: function generate(








    answers) {} }, { key: 



    generate, value: function value(answers) {
      var res;

      if (!this.mute) _justo2.default.runner.reporters.start("Generation");
      res = this.generate(answers);
      if (!this.mute) _justo2.default.runner.reporters.end();

      return res;} }, { key: "run", value: function run() 








    {
      var snippet;


      this.answers = Object.assign({}, this.responses);


      this.init();
      this.prompt(this.answers);
      this.pregenerate(this.answers);
      if (snippet = this[generate](this.answers)) console.log(snippet);
      this.fin();} }, { key: "confirm", value: function confirm(














    q) {
      var res;


      if (typeof q == "string") q = { name: q };


      if (this.responses.hasOwnProperty(q.name)) res = [true, "true", "yes"].indexOf(this.responses[q.name]) >= 0;else 
      res = inquirer.confirm(Object.assign({ title: getTitle(this.params[q.name]) }, q));

      this.answers[q.name] = res;


      return res;} }, { key: "input", value: function input(













    q) {
      var res;


      if (typeof q == "string") q = { name: q };


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.input(Object.assign({ title: getTitle(this.params[q.name]) }, q));

      this.answers[q.name] = res;


      return res;} }, { key: "password", value: function password(













    q) {
      var res;


      if (typeof q == "string") q = { name: q };


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.password(Object.assign({ title: getTitle(this.params[q.name]) }, q));

      this.answers[q.name] = res;


      return res;} }, { key: "checkbox", value: function checkbox(













    q) {
      var res;


      if (typeof q == "string") q = { name: q };


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.checkbox(Object.assign({ title: getTitle(this.params[q.name]), choices: getChoices(this.params[q.name]) }, q));

      this.answers[q.name] = res;


      return res;} }, { key: "list", value: function list(













    q) {
      var res;


      if (typeof q == "string") q = { name: q };


      if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];else 
      res = inquirer.list(Object.assign({ title: getTitle(this.params[q.name]), choices: getChoices(this.params[q.name]) }, q));

      this.answers[q.name] = res;


      return res;} }, { key: "copy", value: function copy(












    src, name) {var _this = this;
      var entry, dst;


      entry = _path2.default.join(this.src, src);

      if (!fs.exists(entry)) {
        throw new Error("The '" + entry + "' file/dir doesn't exist.");}



      if (name) dst = _path2.default.join(this.dst, _path2.default.dirname(src), name);else 
      dst = _path2.default.join(this.dst, src);


      if (this.mute) this[_copy](entry, dst);else 
      this.simple(function (params) {return _this[_copy].apply(_this, _toConsumableArray(params));})("Generate " + new fs.File(dst).replacePath(this.dst + "/"), entry, dst);} }, { key: 


    _copy, value: function value(src, dst) {
      fs.copy(src, dst);} }, { key: "copyIf", value: function copyIf(





    cond) {for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}
      if (isTrue(cond)) this.copy.apply(this, args);} }, { key: "append", value: function append(














    dst, text, line) {var _this2 = this;
      var entry;


      entry = _path2.default.join(this.dst, dst);

      if (!fs.exists(entry)) {
        throw new Error("The '" + entry + "' file doesn't exist.");}



      if (this.mute) this[_append](entry, text, line);else 
      this.simple(function (params) {return _this2[_append].apply(_this2, _toConsumableArray(params));})("Append content to " + entry, entry, text, line);} }, { key: 


    _append, value: function value(dst, text, line) {
      new fs.File(dst).appendText(text, line);} }, { key: "appendIf", value: function appendIf(





    cond) {for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {args[_key2 - 1] = arguments[_key2];}
      if (isTrue(cond)) this.append.apply(this, args);} }, { key: "read", value: function read(








    src) {

      src = new fs.File(this.base, src);
      if (!src.exists()) {
        throw new Error("The '" + src.path + "' file doesn't exist.");}



      return src.text;} }, { key: "remove", value: function remove() 







    {var _this3 = this;for (var _len3 = arguments.length, entry = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {entry[_key3] = arguments[_key3];}

      entry = _path2.default.join.apply(_path2.default, [this.dst].concat(_toConsumableArray(entry)));


      if (this.mute) this[_remove](entry);else 
      this.simple(function (params) {return _this3[_remove].apply(_this3, _toConsumableArray(params));})("Remove " + new fs.File(entry).replacePath(this.dst + "/"), entry);} }, { key: 



    _remove, value: function value(entry) {
      fs.remove(entry);} }, { key: "removeIf", value: function removeIf(








    cond) {for (var _len4 = arguments.length, entry = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {entry[_key4 - 1] = arguments[_key4];}
      if (cond) this.remove.apply(this, entry);} }, { key: "template", value: function template() 
















    {
      throw new Error("Abstract method.");} }, { key: "templateIf", value: function templateIf(





    cond) {for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {args[_key5 - 1] = arguments[_key5];}
      if (isTrue(cond)) this.template.apply(this, args);} }, { key: "templateAsString", value: function templateAsString() 










    {
      throw new Error("Abstract method.");} }, { key: "mkdir", value: function mkdir(







    dir) {var _this4 = this;

      dir = _path2.default.join(this.dst, dir);


      if (this.mute) this[_mkdir](dir);else 
      this.simple(function (params) {return _this4[_mkdir].apply(_this4, _toConsumableArray(params));})("Create dir " + new fs.Dir(dir).replacePath(this.dst + "/"), dir);} }, { key: 


    _mkdir, value: function value(dir) {
      dir = new fs.Dir(dir);

      if (!dir.exists()) {
        if (!dir.create()) {
          throw new Error("The '" + dir.path + "' directory hasn't been able to be created.");}}} }, { key: "mkdirIf", value: function mkdirIf(







    cond) {for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {args[_key6 - 1] = arguments[_key6];}
      if (isTrue(cond)) this.mkdir.apply(this, args);} }, { key: "cli", value: function cli(







    opts) {var _this5 = this;
      var cmd, args;


      cmd = opts.path ? _path2.default.join(opts.path, opts.cmd) : opts.cmd;
      args = opts.args || [];


      if (this.mute) return this[_cli](cmd, args, opts);else 
      return this.simple(function (params) {return _this5[_cli].apply(_this5, _toConsumableArray(params));})("Run " + cmd + " " + args.join(" "), cmd, args, opts);} }, { key: 


    _cli, value: function value(cmd, args, opts) {
      var res;


      res = _child_process2.default.spawnSync(cmd, args, { cwd: opts.wd || this.dst, shell: !!opts.shell });


      return res.status !== null ? res.status : 1;} }, { key: "cliIf", value: function cliIf(





    cond) {for (var _len7 = arguments.length, args = Array(_len7 > 1 ? _len7 - 1 : 0), _key7 = 1; _key7 < _len7; _key7++) {args[_key7 - 1] = arguments[_key7];}
      if (isTrue(cond)) return this.cli.apply(this, args);} }, { key: "base", get: function get() {return this.src;} }, { key: "desc", get: function get() {return "";} }, { key: "params", get: function get() {return {};} }, { key: "help", get: function get() {return { desc: this.desc, params: this.params };} }]);return Generator;}();exports.default = Generator;









function isTrue(cond) {
  return [true, "true", "yes"].indexOf(cond) >= 0;}







function getTitle(q) {
  return q ? typeof q == "string" ? q : q.title : undefined;}







function getChoices(q) {
  return q ? q.choices : undefined;}