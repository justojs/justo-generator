//imports
import path from "path";
import {Handlebars} from "justo-handlebars";
import * as fs from "justo-fs";
import Generator from "./Generator";

//private members
const template = Symbol();

//internal data
const hbs = new Handlebars();

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
    var dst, opts, scope, alias;

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

    //(2) render
    //create parent dir
    dst = new fs.Dir(this.dst, path.dirname(entry));
    dst.create();
    dst = (alias ? new fs.File(this.dst, path.dirname(entry), alias) : new fs.File(this.dst, entry));

    //render
    if (this.mute) this[template](entry, scope, opts, dst);
    else this.simple(params => this[template](...params))(`Generate ${new fs.File(dst).replacePath(this.dst + "/")}`, entry, scope, opts, dst);
  }

  [template](entry, scope, opts, dst) {
    dst.text = this.templateAsString(entry, scope, opts);
  }

  /**
   * @override
   */
  templateAsString(file, scope, opts) {
    return hbs.renderFile(path.join(this.src, file), {
      dir: {
        path: process.cwd(),
        name: path.basename(process.cwd()),
        parent: path.dirname(process.cwd())
      },
      scope: scope
    }, opts);
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
    return hbs.hasHelper(name);
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
   * Read the partials into a folder and register them.
   * The partial name is the file name.
   *
   * @param dir:string  The directory.
   * @param ns?:string  The namespace or prefix.
   */
  registerPartialsFromFolder(dir, ns) {
    //(1) get dir
    dir = new fs.Dir(this.src, dir);
    if (!dir.exists()) return;

    //(2) register partials
    for (let entry of dir.entries) {
      if (entry instanceof fs.File) {
        this.registerPartial((ns || "") + entry.name.replace(".hbs", ""), entry.text);
      }
    }
  }

  /**
   * Check whether the partial exists.
   *
   * @param name:string The partial name.
   * @return boolean
   */
  hasPartial(name) {
    return hbs.hasPartial(name);
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
