//imports
import path from "path";
import * as hbs from "handlebars";
import * as fs from "justo-fs";
import Generator from "./Generator";

/**
 * A generator to use Handlebars as template system.
 */
export default class HandlebarsGenerator extends Generator {
  /**
   * Constructor.
   */
  constructor(...args) {
    //(1) super
    super(...args);

    //(2) register built-in helpers
    this.registerHelper("http", function(url) {
      if (/^http[s]?:/.test(url)) return url;
      else return "http://" + url;
    });

    this.registerHelper("true", function(x) {
      return ([true, "true", "yes"].indexOf(x) >= 0);
    });

    this.registerHelper("false", function(x) {
      return ([false, "false", "no"].indexOf(x) >= 0);
    });

    this.registerHelper("eq", function(x, y) {
      return (x == y);
    });

    this.registerHelper("ne", function(x, y) {
      return (x != y);
    });

    this.registerHelper("lt", function(x, y) {
      return (x < y);
    });

    this.registerHelper("le", function(x, y) {
      return (x <= y);
    });

    this.registerHelper("gt", function(x, y) {
      return (x > y);
    });

    this.registerHelper("ge", function(x, y) {
      return (x >= y);
    });

    this.registerHelper("in", function(value, coll) {
      return (coll.indexOf(value) >= 0);
    });

    this.registerHelper("nin", function(value, coll) {
      return (coll.indexOf(value) < 0);
    });

    this.registerHelper("iif", function(cond, tr, fls) {
      return cond ? tr : fls;
    });

    this.registerHelper("coalesce", function(args) {
      var res;

      //(1) check
      for (let arg of args) {
        if (arg !== undefined && arg !== null) {
          res = arg;
          break;
        }
      }

      //(2) return
      return res;
    });

    this.registerHelper("include", (file) => {
      return new fs.File(this.src, file).text;
    });
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
   * @param scope:object
   * @param opts:object   The render options: helpers, partials.
   *
   * @overload
   * @param entry:string
   * @param alias:string
   * @param [scope]:object
   *
   * @overload
   * @param entry:string
   * @param alias:string
   * @param scope:object
   * @param opts:object
   */
  template(entry, ...args) {
    var src, dst, tmp, opts, scope, alias;

    //(1) params
    if (args.length == 1) {
      if (typeof(args[0]) == "string") alias = args[0];
      else scope = args[0];
    } else if (args.length == 2) {
      if (typeof(args[0]) == "string") [alias, scope] = args;
      else [scope, opts] = args;
    } else if (args.length >= 3) {
      [alias, scope, opts] = args;
    }

    if (!scope) scope = {};
    if (!opts) opts = {};

    //(2) check if existing
    src = new fs.File(this.base, entry);
    if (!src.exists()) throw new Error(`The '${src.path}' file doesn't exist.`);

    //(3) copy
    //create parent dir
    dst = new fs.Dir(this.dst, path.dirname(entry));
    dst.create();
    dst = (alias ? new fs.File(this.dst, path.dirname(entry), alias) : new fs.File(this.dst, entry));

    //add partials and helpers
    if (opts.helpers) {
      for (let hlpr in opts.helpers) this.registerHelper(hlpr, opts.helpers[hlpr]);
    }

    if (opts.partials) {
      for (let prtl in opts.partials) this.registerPartial(prtl, opts.partials[prtl]);
    }

    //render
    tmp = hbs.compile(src.text, opts);

    dst.text = tmp({
      dir: {
        path: process.cwd(),
        name: path.basename(process.cwd()),
        parent: path.dirname(process.cwd())
      },
      scope: scope
    });

    //remove partials and helpers
    if (opts.helpers) {
      for (let hlpr in opts.helpers) this.unregisterHelper(hlpr);
    }

    if (opts.partials) {
      for (let prtl in opts.partials) this.unregisterPartial(prtl);
    }
  }

  /**
   * Register a helper.
   *
   * @param name:string     The helper name.
   * @param helper:function The helper function.
   */
  registerHelper(...args) {
    hbs.registerHelper(...args);
  }

  /**
   * Check whether the helper exist.
   *
   * @param name:string The helper name.
   * @return boolean
   */
  hasHelper(name) {
    return !!hbs.helpers[name];
  }

  /**
   * Unregister a helper.
   *
   * @param name:string The helper name.
   */
  unregisterHelper(name) {
    hbs.unregisterHelper(name);
  }

  /**
   * Register a partial.
   *
   * @param name:string The partial name.
   * @param tmp:string  The partial content.
   */
  registerPartial(...args) {
    hbs.registerPartial(...args);
  }

  /**
   * Reads a partial from a file and register it.
   *
   * @param name:string The partial name.
   * @param file:string The file path.
   */
  registerPartialFromFile(name, file) {
    this.registerPartial(name, new fs.File(this.src, file).text);
  }

  /**
   * Check whether the partial exists.
   *
   * @param name:string The partial name.
   * @return boolean
   */
  hasPartial(name) {
    return !!hbs.partials[name];
  }

  /**
   * Unregister a partial.
   *
   * @param name:string The partial name.
   */
  unregisterPartial(name) {
    hbs.unregisterPartial(name);
  }
}
