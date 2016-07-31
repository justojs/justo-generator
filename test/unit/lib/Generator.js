//imports
const assert = require("assert");
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const workflow = justo.workflow;
const spy = require("justo-spy");
const fs = require("justo-fs");
const Dir = fs.Dir;
const file = require("justo-assert-fs").file;
const dir = require("justo-assert-fs").dir;
const Generator = require("../../../dist/es5/nodejs/justo-generator").Generator;

//suite
suite("Generator", function() {
  suite("#constructor()", function() {
    test("constructor()", function() {
      (function() {
        try {
          var gen = new Generator({mute: true});
        } catch (e) {
          e.message.must.be.eq("Generator options expected.");
        }
      })();
    });

    test("constructor(opts) - Without name", function() {
      var gen = new Generator({mute: true});
      gen.must.have({
        name: "unknown",
        base: undefined,
        dst: process.cwd()
      });
    });

    test("constructor({name, src, dst})", function() {
      var gen = new Generator({mute: true, name: "test", src: "test/unit/data", dst: "test/unit/tmp"});
      gen.must.have({
        name: "test",
        base: "test/unit/data",
        dst: "test/unit/tmp",
        responses: {},
        answers: {}
      });
    });

    test("constructor({name, base})", function() {
      var gen = new Generator({mute: true, name: "test", src: "test/unit/data"});
      gen.must.have({
        name: "test",
        base: "test/unit/data",
        dst: process.cwd(),
        responses: {},
        answers: {}
      });
    });

    test("constructor(opts, responses)", function() {
      var gen = new Generator({mute: true, name: "test", src: "test/unit/data"}, {one: 1, two: 2});

      gen.must.have({
        name: "test",
        base: "test/unit/data",
        dst: process.cwd(),
        responses: {one: 1, two: 2},
        answers: {}
      });
    });
  });

  suite("utils", function() {
    var gen;

    init("*", function() {
      gen = new Generator({mute: true, name: "test", src: "test/unit/data", dst: "test/unit/data"});
    });

    suite("#clipboard()", function() {
      test({name: "clipboard(text)", ignore: process.env.TRAVIS == "true"}, function() {
        gen.clipboard("the text");
      });
    });

    suite("#getFiles()", function() {
      test("getFiles(dir)", function() {
        gen.getFiles("handlebars").length.must.be.eq(1);
      });
    });

    suite("#getFileNames()", function() {
      test("getFileNames(dir)", function() {
        gen.getFileNames("handlebars").must.be.eq(["file.json"]);
      });

      test("getFileNames(dir, opts)", function() {
        gen.getFileNames("handlebars", {ext: false}).must.be.eq(["file"]);
      });
    });

    suite("#hasEntry()", function() {
      test("hasEntry(path) : true", function() {
        gen.hasEntry("handlebars").must.be.eq(true);
      });

      test("hasEntry(path) : false", function() {
        gen.hasEntry("unknown").must.be.eq(false);
      });
    });

    suite("#getEntryNames()", function() {
      test("getEntryNames(dir)", function() {
        gen.getEntryNames("handlebars").sort().must.be.eq(["file.json", "helpers", "partial"]);
      });
    });

    suite("#toSnakeCase()", function() {
      test("toSnakeCase(text)", function() {
        gen.toSnakeCase("this is-an example").must.be.eq("this_is_an_example");
      });

      test("toSnakeCase(text, {case: \"lower\"})", function() {
        gen.toSnakeCase("this IS-AN eXample", {case: "lower"}).must.be.eq("this_is_an_example");
      });

      test("toSnakeCase(text, {case: \"upper\"})", function() {
        gen.toSnakeCase("this IS-AN eXample", {case: "upper"}).must.be.eq("THIS_IS_AN_EXAMPLE");
      });
    });

    suite("#toCamelCase()", function() {
      test("toCamelCase(text)", function() {
        gen.toCamelCase("this is-an_example").must.be.eq("thisIsAnExample");
      });

      test("toCamelCase(text, {capitalized: true})", function() {
        gen.toCamelCase("this Is-an_example", {capitalized: true}).must.be.eq("ThisIsAnExample");
      });

      test("toCamelCase(text, {capitalized: false})", function() {
        gen.toCamelCase("This is-an_Example", {capitalized: false}).must.be.eq("thisIsAnExample");
      });
    });
  });

  suite("Inquire", function() {
    suite("With answer using parameter", function() {
      var gen;

      test("confirm() - parameter is true as string", function() {
        gen = new Generator({mute: true, name: "test", src: "test/unit/data/"}, {
          test: "true"
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(true);
      });

      test("confirm() - parameter is yes", function() {
        gen = new Generator({mute: true, name: "test", src: "test/unit/data/"}, {
          test: "yes"
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(true);
      });

      test("confirm() - parameter is true as boolean", function() {
        gen = new Generator({mute: true, name: "test", src: "test/unit/data/"}, {
          test: true
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(true);
      });

      test("confirm() - parameter is false", function() {
        gen = new Generator({mute: true, name: "test", src: "test/unit/data/"}, {
          test: "false"
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(false);
      });
    });

    suite("With default answers", function() {
      var gen;

      init("*", function() {
        gen = new Generator({mute: true, name: "test", src: "test/unit/data/"}, {
          confirm: true,
          input: "elvisc",
          password: "costello",
          checkbox: ["one", "three"],
          list: "two"
        });
      });

      test("confirm()", function() {
        var res;

        res = gen.confirm({name: "confirm", title: "Is it OK?", default: false});
        res.must.be.eq(true);
        gen.answers.confirm.must.be.eq(true);
      });

      test("input()", function() {
        var res;

        res = gen.input({name: "input", title: "Username", default: "ecostello"});
        res.must.be.eq("elvisc");
        gen.answers.input.must.be.eq("elvisc");
      });

      test("password()", function() {
        var res;

        res = gen.password({name: "password", title: "Password"});
        res.must.be.eq("costello");
        gen.answers.password.must.be.eq("costello");
      });

      test("#checkbox()", function() {
        var res;

        res = gen.checkbox({name: "checkbox", title: "Check", choices: ["one", "two", "three"]});
        res.must.be.eq(["one", "three"]);
        gen.answers.checkbox.must.be.eq(["one", "three"]);
      });

      test("#list()", function() {
        var res;

        res = gen.list({name: "list", title: "List", choices: ["one", "two", "three"]});
        res.must.be.eq("two");
        gen.answers.list.must.be.eq("two");
      });
    });

    // suite({name: "Without default answers", onlyif: process.env.TRAVIS != "true"}, function() {
    //   var gen;
    //
    //   init("*", function() {
    //     gen = new Generator({mute: true, name: "test"});
    //   });
    //
    //   test("confirm()", function() {
    //     var res;
    //
    //     res = gen.confirm({name: "confirm", title: "Confirm (response: y)?", default: false});
    //     res.must.be.eq(true);
    //     gen.answers.confirm.must.be.eq(true);
    //   });
    //
    //   test("input()", function() {
    //     var res;
    //
    //     res = gen.input({name: "input", title: "Username (response: elvisc)", default: "ecostello"});
    //     res.must.be.eq("elvisc");
    //     gen.answers.input.must.be.eq("elvisc");
    //   });
    //
    //   test("password()", function() {
    //     var res;
    //
    //     res = gen.password({name: "password", title: "Password (response: costello)"});
    //     res.must.be.eq("costello");
    //     gen.answers.password.must.be.eq("costello");
    //   });
    //
    //   test("#checkbox()", function() {
    //     var res;
    //
    //     res = gen.checkbox({name: "checkbox", title: "Check (response: one, three)", choices: ["one", "two", "three"]});
    //     res.must.be.eq(["one", "three"]);
    //     gen.answers.checkbox.must.be.eq(["one", "three"]);
    //   });
    //
    //   test("#checkbox() - none checked", function() {
    //     var res;
    //
    //     res = gen.checkbox({name: "checkbox", title: "Check (response: INTRO)", choices: ["one", "two", "three"]});
    //     res.must.be.eq([]);
    //     gen.answers.checkbox.must.be.eq([]);
    //   });
    //
    //   test("#list()", function() {
    //     var res;
    //
    //     res = gen.list({name: "list", title: "List (response: two)", choices: ["one", "two", "three"]});
    //     res.must.be.eq("two");
    //     gen.answers.list.must.be.eq("two");
    //   });
    // });

    // suite({name: "With default title and choices", onlyif: process.env.TRAVIS != "true"}, function() {
    //   var gen;
    //
    //   function TestGenerator() {
    //     Generator.call(this);
    //   }
    //
    //   require("util").inherits(TestGenerator, Generator);
    //
    //   Object.defineProperty(TestGenerator.prototype, "params", {get: function() {
    //     return {
    //       confirm: "Confirm (response: y)?",
    //       input: "Username (response: elvisc)",
    //       password: "Password (response: costello)",
    //       checkbox: {
    //         title: "Check (response: one, three)",
    //         choices: ["one", "two", "three"]
    //       },
    //       list: {
    //         title: "List (response: two)",
    //         choices: ["one", "two", "three"]
    //       }
    //     };
    //   }});
    //
    //   init("*", function() {
    //     gen = new TestGenerator();
    //   });
    //
    //   test("confirm()", function() {
    //     var res;
    //
    //     res = gen.confirm({name: "confirm", default: false});
    //     res.must.be.eq(true);
    //     gen.answers.confirm.must.be.eq(true);
    //   });
    //
    //   test("input()", function() {
    //     var res;
    //
    //     res = gen.input({name: "input", default: "ecostello"});
    //     res.must.be.eq("elvisc");
    //     gen.answers.input.must.be.eq("elvisc");
    //   });
    //
    //   test("password()", function() {
    //     var res;
    //
    //     res = gen.password({name: "password"});
    //     res.must.be.eq("costello");
    //     gen.answers.password.must.be.eq("costello");
    //   });
    //
    //   test("#checkbox()", function() {
    //     var res;
    //
    //     res = gen.checkbox({name: "checkbox"});
    //     res.must.be.eq(["one", "three"]);
    //     gen.answers.checkbox.must.be.eq(["one", "three"]);
    //   });
    //
    //   test("#checkbox() - none checked", function() {
    //     var res;
    //
    //     res = gen.checkbox({name: "checkbox", title: "Check (response: INTRO)"});
    //     res.must.be.eq([]);
    //     gen.answers.checkbox.must.be.eq([]);
    //   });
    //
    //   test("#list()", function() {
    //     var res;
    //
    //     res = gen.list({name: "list"});
    //     res.must.be.eq("two");
    //     gen.answers.list.must.be.eq("two");
    //   });
    // });
  });

  suite("#read()", function() {
    var gen;

    init("*", function() {
      gen = new Generator({mute: true, name: "test", src: "test/unit/data/", dst: "DST.path"});
    });

    test("read(file)", function() {
      gen.read("static/file.txt").must.be.eq("File content.\n");
    });

    test("read(file) - unknown file", function() {
      gen.read.bind(gen).must.raise(Error, ["static/unknown.txt"]);
    });
  });

  suite("#exists()", function() {
    var gen;

    init("*", function() {
      gen = new Generator({mute: true, name: "test", src: "test/unit/data/", dst: "test/unit/data"});
    });

    test("exists(file) : true", function() {
      gen.exists("static/file.txt").must.be.eq(true);
    });

    test("exists(dir, file) : true", function() {
      gen.exists("static", "file.txt").must.be.eq(true);
    });

    test("exists(dir) : true", function() {
      gen.exists("handlebars").must.be.eq(true);
    });

    test("exists(dir, subdir) : true", function() {
      gen.exists("handlebars", "helpers").must.be.eq(true);
    });

    test("exists(entry) : false", function() {
      gen.exists("unknown").must.be.eq(false);
    });

    test("exists(dir, entry) : false", function() {
      gen.exists("static", "unknown").must.be.eq(false);
    });
  });

  suite("Mute generation", function() {
    var gen, DST_DIR, DST;

    init("*", function() {
      DST_DIR = Dir.createTmpDir();
      DST = DST_DIR.path;

      gen = new Generator({mute: true, name: "test", src: "test/unit/data/", dst: DST});
    });

    fin("*", function() {
      DST_DIR.remove();
    });

    suite("#cli()", function() {
      test("cli() - existing command", function() {
        gen.cli({cmd: "node", args: ["-e", "console.log('bonjour')"], wd: "."}).must.be.eq(0);
      });

      test("cli() - nonexisting command", function() {
        gen.cli({cmd: "unknowncommand", args: [], wd: "."}).must.not.be.eq(0);
      });
    });

    suite("#mkdir()", function() {
      test("mkdir(dir) - dir not existing", function() {
        gen.mkdir("test1");
        dir(DST, "test1").must.exist();
      });

      test("mkdir(dir, subdir) - dir not existing", function() {
        gen.mkdir("test1", "test2");
        dir(DST, "test1", "test2").must.exist();
      });

      test("mkdir(dir) - dir existing", function() {
        gen.mkdir("test1");
        dir(DST, "test1").must.exist();
        gen.mkdir("test1");
        dir(DST, "test1").must.exist();
      });
    });

    suite("#append()", function() {
      init("*", function() {
        gen.copy("static/append.txt");
      });

      test("append(file, text)", function() {
        gen.append("static/append.txt", "hi");
        file(DST, "static/append.txt").text.must.be.eq("zero\none\ntwo\nthree\nhi");
      });

      test("append(file, text, line)", function() {
        gen.append("static/append.txt", "hi", -2);
        file(DST, "static/append.txt").text.must.be.eq("zero\none\ntwo\nhithree\n");
      });
    });

    suite("#copy()", function() {
      test("copy(file) - file existing", function() {
        gen.copy("static/file.json");
        file(DST, "static/file.json").must.exist();
      });

      test("copy(file, alias) - file existing", function() {
        gen.copy("static/file.json", "f.json");
        file(DST, "static/f.json").must.exist();
      });

      test("copy(dir) - dir existing", function() {
        gen.copy("static");
        dir(DST, "static").must.exist();
        file(DST, "static/file.json").must.exist();
        file(DST, "static/file.txt").must.exist();
      });

      test("copy(dir, alias) - dir existing", function() {
        gen.copy("static", "stat");
        dir(DST, "stat").must.exist();
        file(DST, "stat/file.json").must.exist();
        file(DST, "stat/file.txt").must.exist();
      });

      test("copy(entry) - entry not existing", function() {
        gen.copy.bind(gen).must.raise(Error, ["static/unknown.txt"]);
      });
    });

    suite("#remove()", function() {
      init("*", function() {
        gen.copy("static", "stat");
      });

      test("remove() - entry existing", function() {
        dir(DST, "stat").must.exist();
        gen.remove("stat");
        dir(DST, "stat").must.not.exist();
      });

      test("remove() - entry existing", function() {
        gen.remove("unknownentry");
        dir(DST, "unknownentry").must.not.exist();
      });
    });
  });
})();
