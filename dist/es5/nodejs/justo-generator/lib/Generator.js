"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _path = require("path");var _path2 = _interopRequireDefault(_path);var _child_process = require("child_process");var _child_process2 = _interopRequireDefault(_child_process);var _justoInquirer = require("justo-inquirer");var _justoFs = require("justo-fs");var 



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








    answers) {} }, { key: "pregenerate", value: function pregenerate(








    answers) {} }, { key: "generate", value: function generate(








    answers) {} }, { key: "run", value: function run() 









    {
      var snippet;


      this.answers = Object.assign({}, this.responses);


      this.init();
      this.prompt(this.answers);
      this.pregenerate(this.answers);
      if (snippet = this.generate(this.answers)) console.log(snippet);
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
      if (isTrue(cond)) this.copy.apply(this, args);} }, { key: "remove", value: function remove() 







    {for (var _len2 = arguments.length, entry = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {entry[_key2] = arguments[_key2];}
      fs.remove.apply(fs, [this.dst].concat(entry));} }, { key: "removeIf", value: function removeIf(








    cond) {for (var _len3 = arguments.length, entry = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {entry[_key3 - 1] = arguments[_key3];}
      if (cond) this.remove.apply(this, entry);} }, { key: "template", value: function template() 
















    {
      throw new Error("Abstract method.");} }, { key: "templateIf", value: function templateIf(





    cond) {for (var _len4 = arguments.length, args = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {args[_key4 - 1] = arguments[_key4];}
      if (isTrue(cond)) this.template.apply(this, args);} }, { key: "mkdir", value: function mkdir(







    path) {
      var dir = new fs.Dir(this.dst, path);

      if (!dir.exists()) {
        if (!dir.create()) {
          throw new Error("The '" + dir.path + "' directory hasn't been able to be created.");}}} }, { key: "mkdirIf", value: function mkdirIf(







    cond) {for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {args[_key5 - 1] = arguments[_key5];}
      if (isTrue(cond)) this.mkdir.apply(this, args);} }, { key: "cli", value: function cli(







    opts) {
      var cmd, args, res;


      cmd = opts.path ? _path2.default.join(opts.path, opts.cmd) : opts.cmd;
      args = opts.args;


      res = _child_process2.default.spawnSync(cmd, args, { cwd: opts.wd || ".", shell: !!opts.shell });


      return res.status !== null ? res.status : 1;} }, { key: "cliIf", value: function cliIf(





    cond) {for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {args[_key6 - 1] = arguments[_key6];}
      if (isTrue(cond)) return this.cli.apply(this, args);} }, { key: "base", get: function get() {return this.src;} }, { key: "help", get: function get() {return {};} }]);return Generator;}();exports.default = Generator;









function isTrue(cond) {
  return [true, "true", "yes"].indexOf(cond) >= 0;}
