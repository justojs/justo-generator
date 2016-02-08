"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _path = require("path");var _path2 = _interopRequireDefault(_path);var _inquirer = require("inquirer");var _inquirer2 = _interopRequireDefault(_inquirer);var _deasync = require("deasync");var _deasync2 = _interopRequireDefault(_deasync);var _justoFs = require("justo-fs");var 



fs = _interopRequireWildcard(_justoFs);function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var 









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
      this.answers = {};
      this.init();
      this.prompt(this.answers);
      this.generate(this.answers);
      this.fin();} }, { key: "confirm", value: function confirm(









    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) {
        res = this.responses[q.name];} else 
      {
        (0, _deasync2.default)(function (done) {
          _inquirer2.default.prompt({ 
            type: "confirm", 
            name: q.name, 
            message: q.title || q.name, 
            default: q.default }, 
          function (answers) {
            res = answers[q.name];
            done();});})();}




      this.answers[q.name] = res;


      return res;} }, { key: "input", value: function input(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) {
        res = this.responses[q.name];} else 
      {
        (0, _deasync2.default)(function (done) {
          _inquirer2.default.prompt({ 
            type: "input", 
            name: q.name, 
            message: q.title || q.name, 
            default: q.default, 
            validate: function validate(answer) {
              var res;


              if (q.type) {
                if (q.type === String || q.type == "string") res = true;else 
                if (q.type === Number || q.type == "number") res = !isNaN(answer);else 
                if (q.type === Boolean || q.type == "boolean") res = answer == "true" || answer == "false";} else 
              {
                res = true;}



              return res;}, 

            filter: function filter(answer) {
              var res;


              if (q.type === Number || q.type == "number") res = Number(answer);else 
              if (q.type === Boolean || q.type == "boolean") res = Boolean(answer);else 
              res = answer;


              return res;} }, 

          function (answers) {
            res = answers[q.name];
            done();});})();}




      this.answers[q.name] = res;


      return res;} }, { key: "password", value: function password(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) {
        res = this.responses[q.name];} else 
      {
        (0, _deasync2.default)(function (done) {
          _inquirer2.default.prompt({ 
            type: "password", 
            name: q.name, 
            message: q.title || q.name, 
            validate: function validate(answer) {
              var res;


              if (q.type) {
                if (q.type === String || q.type == "string") res = true;else 
                if (q.type === Number || q.type == "number") res = !isNaN(answer);else 
                if (q.type === Boolean || q.type == "boolean") res = answer == "true" || answer == "false";} else 
              {
                res = true;}



              return res;}, 

            filter: function filter(answer) {
              var res;


              if (q.type === Number || q.type == "number") res = Number(answer);else 
              if (q.type === Boolean || q.type == "boolean") res = Boolean(answer);else 
              res = answer;


              return res;} }, 

          function (answers) {
            res = answers[q.name];
            done();});})();}




      this.answers[q.name] = res;


      return res;} }, { key: "checkbox", value: function checkbox(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) {
        res = this.responses[q.name];} else 
      {
        (0, _deasync2.default)(function (done) {
          _inquirer2.default.prompt({ 
            type: "checkbox", 
            name: q.name, 
            message: q.title || q.name, 
            choices: q.choices, 
            default: q.default }, 
          function (answers) {
            res = answers[q.name];
            done();});})();}




      this.answers[q.name] = res;


      return res;} }, { key: "list", value: function list(








    q) {
      var res;


      if (this.responses.hasOwnProperty(q.name)) {
        res = this.responses[q.name];} else 
      {
        (0, _deasync2.default)(function (done) {
          _inquirer2.default.prompt({ 
            type: "list", 
            name: q.name, 
            message: q.title || q.name, 
            choices: q.choices, 
            default: q.default }, 
          function (answers) {
            res = answers[q.name];
            done();});})();}




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
        fs.copy(entry, _path2.default.join(this.dst, src));}} }, { key: "template", value: function template(















    entry) {
      var src, text, scope, alias;for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {args[_key - 1] = arguments[_key];}


      if (args.length === 0) {
        throw new Error("Scope hasn't been specified.");} else 
      if (args.length == 1) {
        scope = args[0];} else 
      {
        alias = args[0];scope = args[1];}



      src = new fs.File(this.base, entry);
      if (!src.exists()) throw new Error("The '" + src.path + "' file doesn't exist.");


      text = src.text;
      text = eval("`" + text + "`");

      new fs.Dir(this.dst, _path2.default.dirname(entry)).create();

      if (alias) {
        new fs.File(this.dst, _path2.default.dirname(entry), alias).text = text;} else 
      {
        new fs.File(this.dst, entry).text = text;}} }, { key: "mkdir", value: function mkdir(








    path) {
      var dir = new fs.Dir(this.dst, path);

      if (!dir.exists()) {
        if (!dir.create()) {
          throw new Error("The '" + dir.path + "' directory hasn't been able to be created.");}}} }, { key: "base", get: function get() {return this.src;} }]);return Generator;}();exports.default = Generator;
