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

  suite("Mute generation", function() {
    var gen, DST;

    init("*", function() {
      DST = new fs.Dir(fs.Dir.TMP_DIR, Date.now());
      DST.create();

      gen = new Generator({mute: true, name: "test", src: "test/unit/data/", dst: DST.path});
    });

    fin("*", function() {
      DST.remove();
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
      test("mkdir() - dir not existing", function() {
        gen.mkdir("test1");
        dir(DST.path, "test1").must.exist();
      });

      test("mkdir() - dir existing", function() {
        gen.mkdir("test2");
        dir(DST.path, "test2").must.exist();
        gen.mkdir("test2");
        dir(DST.path, "test2").must.exist();
      });
    });

    suite("#copy()", function() {
      test("copy(file) - file existing", function() {
        gen.copy("static/file.json");
        file(DST.path, "static/file.json").must.exist();
      });

      test("copy(file, alias) - file existing", function() {
        gen.copy("static/file.json", "f.json");
        file(DST.path, "static/f.json").must.exist();
      });

      test("copy(dir) - dir existing", function() {
        gen.copy("static");
        dir(DST.path, "static").must.exist();
        file(DST.path, "static/file.json").must.exist();
        file(DST.path, "static/file.txt").must.exist();
      });

      test("copy(dir, alias) - dir existing", function() {
        gen.copy("static", "stat");
        dir(DST.path, "stat").must.exist();
        file(DST.path, "stat/file.json").must.exist();
        file(DST.path, "stat/file.txt").must.exist();
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
        dir(DST.path, "stat").must.exist();
        gen.remove("stat");
        dir(DST.path, "stat").must.not.exist();
      });

      test("remove() - entry existing", function() {
        gen.remove("unknownentry");
        dir(DST.path, "unknownentry").must.not.exist();
      });
    });
  });
})();
