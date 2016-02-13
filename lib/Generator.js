//imports
import path from "path";
import inquirer from "inquirer";
import deasync from "deasync";
import * as fs from "justo-fs";

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
    if (this.responses.hasOwnProperty(q.name)) {
      res = this.responses[q.name];
    } else {
      deasync(function(done) {
        inquirer.prompt({
          type: "confirm",
          name: q.name,
          message: q.title || q.name,
          default: q.default
        }, function(answers) {
          res = answers[q.name];
          done();
        });
      })();
    }

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
    if (this.responses.hasOwnProperty(q.name)) {
      res = this.responses[q.name];
    } else {
      deasync(function(done) {
        inquirer.prompt({
          type: "input",
          name: q.name,
          message: q.title || q.name,
          default: q.default,
          validate: function validate(answer) {
            var res;

            //(1) check
            if (q.type) {
              if (q.type === String || q.type == "string") res = true;
              else if (q.type === Number || q.type == "number") res = !isNaN(answer);
              else if (q.type === Boolean || q.type == "boolean") res = (answer == "true" || answer == "false");
            } else {
              res = true;
            }

            //(2) return
            return res;
          },
          filter: function filter(answer) {
            var res;

            //(1) transform
            if (q.type === Number || q.type == "number") res = Number(answer);
            else if (q.type === Boolean || q.type == "boolean") res = Boolean(answer);
            else res = answer;

            //(2) return
            return res;
          }
        }, function(answers) {
          res = answers[q.name];
          done();
        });
      })();
    }

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
    if (this.responses.hasOwnProperty(q.name)) {
      res = this.responses[q.name];
    } else {
      deasync(function(done) {
        inquirer.prompt({
          type: "password",
          name: q.name,
          message: q.title || q.name,
          validate: function validate(answer) {
            var res;

            //(1) check
            if (q.type) {
              if (q.type === String || q.type == "string") res = true;
              else if (q.type === Number || q.type == "number") res = !isNaN(answer);
              else if (q.type === Boolean || q.type == "boolean") res = (answer == "true" || answer == "false");
            } else {
              res = true;
            }

            //(2) return
            return res;
          },
          filter: function filter(answer) {
            var res;

            //(1) transform
            if (q.type === Number || q.type == "number") res = Number(answer);
            else if (q.type === Boolean || q.type == "boolean") res = Boolean(answer);
            else res = answer;

            //(2) return
            return res;
          }
        }, function(answers) {
          res = answers[q.name];
          done();
        });
      })();
    }

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
    if (this.responses.hasOwnProperty(q.name)) {
      res = this.responses[q.name];
    } else {
      deasync(function(done) {
        inquirer.prompt({
          type: "checkbox",
          name: q.name,
          message: q.title || q.name,
          choices: q.choices,
          default: q.default
        }, function(answers) {
          res = answers[q.name];
          done();
        });
      })();
    }

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
    if (this.responses.hasOwnProperty(q.name)) {
      res = this.responses[q.name];
    } else {
      deasync(function(done) {
        inquirer.prompt({
          type: "list",
          name: q.name,
          message: q.title || q.name,
          choices: q.choices,
          default: q.default
        }, function(answers) {
          res = answers[q.name];
          done();
        });
      })();
    }

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
   * @param scope:object
   *
   * @overload
   * @param entry:string
   * @param alias:string
   * @param scope:object
   */
  template(entry, ...args) {
    var src, text, scope, dir, alias;

    //(1) params
    if (args.length === 0) {
      throw new Error("Scope hasn't been specified.");
    } else if (args.length == 1) {
      scope = args[0];
    } else {
      [alias, scope] = args;
    }

    //(2) check if existing
    src = new fs.File(this.base, entry);
    if (!src.exists()) throw new Error(`The '${src.path}' file doesn't exist.`);

    //(3) copy
    dir = {
      path: process.cwd(),
      name: path.basename(process.cwd()),
      parent: path.dirname(process.cwd())
    };

    text = src.text;
    text = eval("`" + text + "`");

    new fs.Dir(this.dst, path.dirname(entry)).create();

    if (alias) {
      new fs.File(this.dst, path.dirname(entry), alias).text = text;
    } else {
      new fs.File(this.dst, entry).text = text;
    }
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
