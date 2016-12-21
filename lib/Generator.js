//imports
import * as ncp from "copy-paste";
import path from "path";
import child_process from "child_process";
import {Inquirer} from "justo-inquirer";
import * as fs from "justo-fs";
import sync from "justo-sync";
import justo from "justo";

//private members
const copy = Symbol();
const cli = Symbol();
const exists = Symbol();
const mkdir = Symbol();
const remove = Symbol();
const generate = Symbol();
const append = Symbol();

//internal data
const inquirer = new Inquirer();

/**
 * Base for the Justo.js generators.
 *
 * @abstract
 * @readonly name:string        The generator name.
 * @readonly responses:object[] The answers.
 *
 */
export default class Generator {
  /**
   * Constructor.
   */
  constructor(opts = {}, responses = {}) {
    //(1) params
    if (!opts) throw new Error("Generator options expected.");

    //(2) init
    Object.defineProperty(this, "name", {enumerable: true, value: opts.name || "unknown"});
    Object.defineProperty(this, "responses", {enumerable: false, value: responses || {}});
    Object.defineProperty(this, "answers", {enumerable: false, writable: true, value: {}});
    Object.defineProperty(this, "src", {enumerable: false, writable: true, value: opts.src});
    Object.defineProperty(this, "dst", {enumerable: false, writable: true, value: opts.dst || process.cwd()});
    Object.defineProperty(this, "mute", {enumerable: false, value: !!opts.mute});
    Object.defineProperty(this, "simple", {enumerable: false, value: opts.simple || justo.simple});
  }

  /**
   * @alias src
   */
  get base() {
    return this.src;
  }

  /**
   * Generator description.
   *
   * @type string
   */
  get desc() {
    return "";
  }

  /**
   * Generator parameters.
   *
   * @type object
   */
  get params() {
    return {};
  }

  /**
   * Returns the help.
   *
   * @type object
   */
  get help() {
    return {desc: this.desc, params: this.params};
  }

  /**
   * Initialize the generator.
   */
  init() {

  }

  /**
   * Run the final steps.
   */
  fin() {

  }

  /**
   * This can be used to check preconditions as if the destination directory
   * is empty.
   * If the method returns a string, this will be considered as an error.
   *
   * @return object
   */
  preprompt() {

  }

  /**
   * Prompt to the user.
   *
   * @param answers:object  Where the generator saves all the answers.
   */
  prompt(answers) {

  }

  /**
   * Invoked before generate(). Used for pre-generation checking.
   * If the method returns a string, this will be considered as an error.
   *
   * @param answers:object  The user answers.
   * @return object
   */
  pregenerate(answers) {

  }

  /**
   * Generate the scaffolding.
   *
   * @param answers:object  The user answers.
   */
  generate(answers) {

  }

  [generate](answers) {
    var res;

    if (!this.mute) justo.runner.reporters.start("Generation");
    res = this.generate(answers);
    if (!this.mute) justo.runner.reporters.end();

    return res;
  }

  /**
   * Runs the generator.
   *
   * @leaf
   * @private
   */
  run() {
    var err;

    //(1) create answers object
    this.answers = Object.assign({}, this.responses);

    //(2) run
    this.init();

    err = this.preprompt();
    if (!err) {
      this.prompt(this.answers);
      err = this.pregenerate(this.answers);
      if (!err) {
        let snippet = this[generate](this.answers);

        if (snippet) {
          this.clipboard(snippet);
          console.log();
          console.log(snippet);
        }
      }
    }

    if (err) console.error(err instanceof Error ? err.toString() : `Error: ${err}`);

    this.fin();
  }

  /**
   * Confirm a question.
   * Returns `true` or `false`.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), default (boolean).
   * @return boolean
   *
   * @overload
   * @param name:string The question name.
   * @return boolean
   */
  confirm(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) res = ([true, "true", "yes"].indexOf(this.responses[q.name]) >= 0);
    else res = inquirer.confirm(Object.assign(getQOptions(this.params[q.name]), q));

    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), default (object), type (string || class).
   * @return object
   *
   * @overload
   * @param name:string The question name.
   * @return object
   */
  input(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.input(getInquirerOptions(this.params[q.name], q));

    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), type (string || class).
   * @return object
   *
   * @overload
   * @param name:string The question name.
   * @return object
   */
  password(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.password(getInquirerOptions(this.params[q.name], q));

    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), default (string[]), choices (string[]).
   * @return string[]
   *
   * @overload
   * @param name:string The question name.
   * @return string[]
   */
  checkbox(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.checkbox(Object.assign(getQOptions(this.params[q.name]), q));

    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Ask for several options.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), default (string[]), options (string[]).
   * @return string[]
   *
   * @overload
   * @param name:string The question name.
   * @return string[]
   */
  multiselect(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.checkbox(getInquirerOptions(this.params[q.name], q));

    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Ask for an input to select from several options.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), default (string[]), options (string[]).
   * @return string
   *
   * @overload
   * @param name:string The question name.
   * @return string
   */
  select(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) {
      res = this.responses[q.name];
    } else {
      res = inquirer.list(getInquirerOptions(this.params[q.name], q));
    }


    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @overload
   * @param q:object  The question: name (string), title (string), default (string), choices (string[]).
   * @return string
   *
   * @overload
   * @param name:string The question name.
   * @return string
   */
  list(q) {
    var res;

    //(1) arguments
    if (typeof(q) == "string") q = {name: q};

    //(2) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.list(Object.assign(getQOptions(this.params[q.name]), q));

    this.answers[q.name] = res;

    //(3) return
    return res;
  }

  /**
   * Copy text to clipboard.
   *
   * @param text:string The text to copy.
   */
  clipboard(text) {
    sync(function(done) {
      ncp.copy(text, () => done());
    });
  }

  /**
   * Copy a file/dir as it is.
   *
   * @overload
   * @param src:string  The relative source path.
   *
   * @overload
   * @param src:string  The relative source path.
   * @param name:string The name as it must be copied.
   */
  copy(src, name) {
    var entry, dst;

    //(1) check if existing
    entry = path.join(this.src, src);

    if (!fs.exists(entry)) {
      throw new Error(`The '${entry}' file/dir doesn't exist.`);
    }

    //(2) determine dst
    if (name) dst = path.join(this.dst, path.dirname(src), name);
    else dst = path.join(this.dst, src);

    //(3) copy
    if (this.mute) this[copy](entry, dst);
    else this.simple(params => this[copy](...params))(`Generate ${new fs.File(dst).replacePath(this.dst + "/")}`, entry, dst);
  }

  [copy](src, dst) {
    fs.copy(src, dst);
  }

  /**
   * Copy if a condition is true.
   */
  copyIf(cond, ...args) {
    if (isTrue(cond)) this.copy(...args);
  }

  /**
   * Append a text to a file.
   *
   * @overload In the end.
   * @param dst:string  The file.
   * @param text:string The text to append.
   *
   * @overload In a given number of line.
   * @param dst:string  The file.
   * @param text:string The text to append.
   * @param line:number The number of line.
   *
   * @overload In a given number of line.
   * @param dst:string
   * @param text:string
   * @param opts:object The options: line (number) and type (string: start or end).
   */
  append(dst, text, opts) {
    var entry;

    //(1) check if existing
    entry = path.join(this.dst, dst);
    if (!fs.exists(entry)) throw new Error(`The '${entry}' file doesn't exist.`);

    //(2) append
    if (this.mute) {
      this[append](entry, text, opts);
    } else {
      let file = new fs.File(entry).replacePath(this.dst + "/");
      this.simple(params => this[append](...params))(`Append content to ${file}`, entry, text, opts);
    }
  }

  [append](dst, text, opts) {
    new fs.File(dst).appendText(text, opts);
  }

  /**
   * Append if a condition is true.
   */
  appendIf(cond, ...args) {
    if (isTrue(cond)) this.append(...args);
  }

  /**
   * Read a template file.
   *
   * @param src:string  The file path.
   * @return string
   */
  read(src) {
    //(1) check if src existing
    src = new fs.File(this.base, src);
    if (!src.exists()) {
      throw new Error(`The '${src.path}' file doesn't exist.`);
    }

    //(2) return
    return src.text;
  }

  /**
   * Remove a filesystem entry.
   *
   * @param ...entry:string[]  The entry to supress.
   */
  remove(...entry) {
    //(1) entry
    entry = path.join(this.dst, ...entry);

    //(2) remove
    if (this.mute) this[remove](entry);
    else this.simple(params => this[remove](...params))(`Remove ${new fs.File(entry).replacePath(this.dst + "/")}`, entry);
  }


  [remove](entry) {
    fs.remove(entry);
  }

  /**
   * Remove a filesystem entry if a given condition is true.
   *
   * @param cond:boolean      The condition.
   * @param ...entry:string[] The entry to supress.
   */
  removeIf(cond, ...entry) {
    if (cond) this.remove(...entry);
  }

  /**
   * Render a template file.
   *
   * @overload
   * @abstract
   * @param entry:string
   * @param [scope]:object
   *
   * @overload
   * @abstract
   * @param entry:string
   * @param alias:string
   * @param [scope]:object
   */
  template() {
    throw new Error("Abstract method.");
  }

  /**
   * Render the template if the condition is true.
   */
  templateIf(cond, ...args) {
    if (isTrue(cond)) this.template(...args);
  }

  /**
   * Render a template string.
   *
   * @abstract
   * @param file:string
   * @param [scope]:object
   * @return string
   */
  templateAsString() {
    throw new Error("Abstract method.");
  }

  /**
   * Check whether the file/dir path exists.
   *
   * @param ...entry:string  The path.
   * @return boolean
   */
  exists(...entry) {
    if (this.mute) return this[exists](...entry);
    else return this.simple(params => this[exists](...params))(`Check whether '${entry.join("/")}' exists`, ...entry);
  }

  [exists](...entry) {
    return fs.exists(this.dst, ...entry);
  }

  /**
   * Make a directory.
   *
   * @param ...dir:string[]  The relative path.
   */
  mkdir(...dir) {
    //(1) determine dir
    dir = path.join(this.dst, ...dir);

    //(2) create
    if (this.mute) this[mkdir](dir);
    else this.simple(params => this[mkdir](...params))(`Create dir ${new fs.Dir(dir).replacePath(this.dst + "/")}`, dir);
  }

  [mkdir](dir) {
    dir = new fs.Dir(dir);

    if (!dir.exists()) {
      if (!dir.create()) {
        throw new Error(`The '${dir.path}' directory hasn't been able to be created.`);
      }
    }
  }

  /**
   * Make a directory if the condition is true.
   */
  mkdirIf(cond, ...args) {
    if (isTrue(cond)) this.mkdir(...args);
  }

  /**
   * Runs a CLI command.
   *
   * @param opts:object The options: path (string), cmd (string), wd (string), shell (boolean).
   */
  cli(opts) {
    var cmd, args;

    //(1) determine command
    cmd = (opts.path ? path.join(opts.path, opts.cmd) : opts.cmd);
    args = opts.args || [];

    //(2) run
    if (this.mute) return this[cli](cmd, args, opts);
    else return this.simple(params => this[cli](...params))(`Run ${cmd} ${args.join(" ")}`, cmd, args, opts);
  }

  [cli](cmd, args, opts) {
    var res;

    //(1) run
    res = child_process.spawnSync(cmd, args, {cwd: opts.wd || this.dst, shell: !!opts.shell});

    //(2) return
    return (res.status !== null ? res.status : 1);
  }

  /**
   * Runs a CLI command if the given condition is true.
   */
  cliIf(cond, ...args) {
    if (isTrue(cond)) return this.cli(...args);
  }

  /**
   * Return the filesystem entries of a dst directory.
   *
   * @param dir:string  Dir path from the dst dir.
   * @return File[]
   */
  getFiles(dir) {
    return (new fs.Dir(this.dst, dir)).files;
  }

  /**
   * Return the file names.
   *
   * @param dir:string    Dir path from the dst dir.
   * @param [opts]:object The options: ext (boolean).
   */
  getFileNames(dir, opts) {
    return (new fs.Dir(this.dst, dir)).getFileNames(opts);
  }

  /**
   * Return the dir names.
   *
   * @param dir:string    Dir path from the dst dir.
   * @param opts?:object  Options.
   */
  getDirNames(dir, opts) {
    return (new fs.Dir(this.dst, dir)).getDirNames(opts);
  }

  /**
   * Return the entry names.
   *
   * @param dir?:string Dir path from the dst dir.
   */
  getEntryNames(dir = ".") {
    return (new fs.Dir(this.dst, dir)).getEntryNames();
  }

  /**
   * Check whether an entry exists from dst dir.
   *
   * @param ...pth:string The entry path.
   * @return boolean
   */
  hasEntry(...pth) {
    return fs.exists(this.dst, ...pth);
  }

  /**
   * Transform a text to snake case:
   * - Dashs (-) to underscore (_).
   * - Whitespaces to underscore (_).
   *
   * @param text:string The text.
   * @param opts:object The options: case (string: "lower" or "upper").
   * @return string
   */
  toSnakeCase(text, opts = {}) {
    //(1) get case if needed
    if (opts.case == "lower") text = text.toLowerCase();
    else if (opts.case == "upper") text = text.toUpperCase();

    //(2) replace - and whitespaces
    text = text.replace(/[ -]/g, "_");

    //(3) return
    return text;
  }

  /**
   * Transform a text to camelCase.
   *
   * @param text:string The text.
   * @param opts:object The options: capitalized (boolean).
   * @return string
   */
  toCamelCase(text, opts = {}) {
    //(1) transform
    text = text.replace(/([_ -][a-z])/g, (letter) => letter.toUpperCase()).replace(/[_ -]/g, "");

    if (opts.capitalized === true) text = text[0].toUpperCase() + text.slice(1);
    else if (opts.capitalized === false) text = text[0].toLowerCase() + text.slice(1);

    //(2) return
    return text;
  }
}

/**
 * Check whether a condition is true.
 *
 * @param cond:object The condition to check.
 * @return boolean
 */
function isTrue(cond) {
  return ([true, "true", "yes"].indexOf(cond) >= 0);
}

/**
 * Return the question options.
 */
function getQOptions(q) {
  var res = {};

  //(1) pre
  q = q || {};

  //(1) build
  if (typeof(q) == "string") {
    res.title = q;
  } else {
    if (q.hasOwnProperty("title")) res.title = q.title;
    if (q.hasOwnProperty("default")) res.default = q.default;
    if (q.hasOwnProperty("choices")) res.choices = q.choices;
    if (q.hasOwnProperty("options")) res.choices = q.options;
  }

  //(2) return
  return res;
}

function getInquirerOptions(o, c) {
  var res = {};

  //(1) pre
  o = o || {};
  c = c || {};

  //(2) get
  if (typeof(o) == "string") {
    res.title = o;
  } else {
    if (o.hasOwnProperty("name")) res.name = o.name;
    if (o.hasOwnProperty("title")) res.title = o.title;
    if (o.hasOwnProperty("default")) res.default = o.default;
    if (o.hasOwnProperty("choices")) res.choices = o.choices;
    if (o.hasOwnProperty("options")) res.choices = o.options;
    if (o.hasOwnProperty("required")) res.required = o.required;
  }

  if (c.hasOwnProperty("name")) res.name = c.name;
  if (c.hasOwnProperty("title")) res.title = c.title;
  if (c.hasOwnProperty("default")) res.default = c.default;
  if (c.hasOwnProperty("choices")) res.choices = c.choices;
  if (c.hasOwnProperty("options")) res.choices = c.options;
  if (c.hasOwnProperty("required")) res.required = c.required;

  //(2) return
  return res;
}
