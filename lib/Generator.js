//imports
import path from "path";
import child_process from "child_process";
import {Inquirer} from "justo-inquirer";
import * as fs from "justo-fs";

//private members
const copy = Symbol();
const cli = Symbol();
const mkdir = Symbol();
const remove = Symbol();

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
   * Prompt to the user.
   *
   * @param answers:object  Where the generator saves all the answers.
   */
  prompt(answers) {

  }

  /**
   * Invoked before generate(). Used for pre-generation checking.
   *
   * @param answers:object  The user answers.
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

  /**
   * Runs the generator.
   *
   * @leaf
   * @private
   */
  run() {
    var snippet;

    //(1) create answers object
    this.answers = Object.assign({}, this.responses);

    //(2) run
    this.init();
    this.prompt(this.answers);
    this.pregenerate(this.answers);
    if ((snippet = this.generate(this.answers))) console.log(snippet);
    this.fin();
  }

  /**
   * Confirm a question.
   * Returns `true` or `false`.
   *
   * @param q:object  The question: name (string), title (string), default (boolean).
   * @return boolean
   */
  confirm(q) {
    var res;

    //(1) prompt
    if (this.responses.hasOwnProperty(q.name)) res = ([true, "true", "yes"].indexOf(this.responses[q.name]) >= 0);
    else res = inquirer.confirm(Object.assign({title: getTitle(this.params[q.name])}, q));

    this.answers[q.name] = res;

    //(2) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @param q:object  The question: name (string), title (string), default (object), type (string || class).
   * @return object
   */
  input(q) {
    var res;

    //(1) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.input(Object.assign({title: getTitle(this.params[q.name])}, q));

    this.answers[q.name] = res;

    //(2) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @param q:object  The question: name (string), title (string), type (string || class).
   * @return object
   */
  password(q) {
    var res;

    //(1) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.password(Object.assign({title: getTitle(this.params[q.name])}, q));

    this.answers[q.name] = res;

    //(2) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @param q:object  The question: name (string), title (string), default (string[]), choices (string[]).
   * @return string[]
   */
  checkbox(q) {
    var res;

    //(1) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.checkbox(Object.assign({title: getTitle(this.params[q.name]), choices: getChoices(this.params[q.name])}, q));

    this.answers[q.name] = res;

    //(2) return
    return res;
  }

  /**
   * Ask for input.
   *
   * @param q:object  The question: name (string), title (string), default (string), choices (string[]).
   * @return string[]
   */
  list(q) {
    var res;

    //(1) prompt
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.list(Object.assign({title: getTitle(this.params[q.name]), choices: getChoices(this.params[q.name])}, q));

    this.answers[q.name] = res;

    //(2) return
    return res;
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
    if (!this.mute) console.log(`Copy ${dst}`);
    this[copy](entry, dst);
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
    if (!this.mute) console.log(`Remove ${entry}`);
    this[remove](entry);
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
   * Make a directory.
   *
   * @param dir:string  The relative path.
   */
  mkdir(dir) {
    //(1) determine dir
    dir = path.join(this.dst, dir);

    //(2) create
    if (!this.mute) console.log(`Create directory ${dir}`);
    this[mkdir](dir);
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
    if (!this.mute) console.log(`Run ${cmd} ${args.join(" ")}`);
    return this[cli](cmd, args, opts);
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
 * Return the param.title.
 *
 * @param q:object
 */
function getTitle(q) {
  return (q ? (typeof(q) == "string" ? q : q.title) : undefined);
}

/**
 * Return the param.choices.
 *
 * @param q:object
 */
function getChoices(q) {
  return (q ? q.choices : undefined);
}
