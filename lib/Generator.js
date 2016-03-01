//imports
import path from "path";
import {Inquirer} from "justo-inquirer";
import * as fs from "justo-fs";
import * as handlebars from "handlebars";

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
  }

  /**
   * @alias src
   */
  get base() {
    return this.src;
  }

  /**
   * Generator help.
   *
   * @type object
   */
  get help() {
    return {};
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
   * Generate the scaffolding.
   *
   * @param answers:object  The user answers.
   */
  generate(answers) {

  }

  /**
   * Runs the generator.
   */
  run() {
    this.answers = Object.assign({}, this.responses);
    this.init();
    this.prompt(this.answers);
    this.generate(this.answers);
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
    if (this.responses.hasOwnProperty(q.name)) res = this.responses[q.name];
    else res = inquirer.confirm(q);

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
    else res = inquirer.input(q);

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
    else res = inquirer.password(q);

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
    else res = inquirer.checkbox(q);

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
    else res = inquirer.list(q);

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
    entry = path.join(this.base, src);

    if (!fs.exists(entry)) {
      throw new Error(`The '${entry}' file/dir doesn't exist.`);
    }

    //(2) copy
    if (name) {
      fs.copy(entry, path.join(this.dst, path.dirname(src), name));
    } else {
      fs.copy(entry, path.join(this.dst, src));
    }
  }

  /**
   * Copy a file processing its content.
   *
   * @overload
   * @param entry:string
   * @param [scope]:object
   *
   * @overload
   * @param entry:string
   * @param alias:string
   * @param [scope]:object
   */
  template(entry, ...args) {
    var src, dst, tmp, scope, alias;

    //(1) params
    if (args.length == 1) {
      if (typeof(args[0]) == "string") alias = args[0];
      else scope = args[0];
    } else if (args.length >= 2) {
      [alias, scope] = args;
    }

    if (!scope) scope = {};

    //(2) check if existing
    src = new fs.File(this.base, entry);
    if (!src.exists()) throw new Error(`The '${src.path}' file doesn't exist.`);

    //(3) copy
    dst = new fs.Dir(this.dst, path.dirname(entry));
    dst.create();
    dst = (alias ? new fs.File(this.dst, path.dirname(entry), alias) : new fs.File(this.dst, entry));

    tmp = handlebars.compile(src.text);
    dst.text = tmp({
      dir: {
        path: process.cwd(),
        name: path.basename(process.cwd()),
        parent: path.dirname(process.cwd())
      },
      scope: scope
    });
  }

  /**
   * Makes a directory.
   *
   * @param path:string The relative path.
   */
  mkdir(path) {
    var dir = new fs.Dir(this.dst, path);

    if (!dir.exists()) {
      if (!dir.create()) {
        throw new Error(`The '${dir.path}' directory hasn't been able to be created.`);
      }
    }
  }
}
