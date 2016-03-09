//imports
const assert = require("assert");
const fs = require("justo-fs");
const file = require("justo-assert-fs").file;
const dir = require("justo-assert-fs").dir;
const Generator = require("../../../dist/es5/nodejs/justo-generator").Generator;

//suite
describe("Generator", function() {
  describe("#constructor()", function() {
    it("constructor()", function() {
      (function() {
        try {
          var gen = new Generator();
        } catch (e) {
          e.message.must.be.eq("Generator options expected.");
        }
      })();
    });

    it("constructor(opts) - Without name", function() {
      var gen = new Generator({});
      gen.must.have({
        name: "unknown",
        base: undefined,
        dst: process.cwd()
      });
    });

    it("constructor({name, src, dst})", function() {
      var gen = new Generator({name: "test", src: "test/unit/data", dst: "test/unit/tmp"});
      gen.must.have({
        name: "test",
        base: "test/unit/data",
        dst: "test/unit/tmp",
        responses: {},
        answers: {}
      });
    });

    it("constructor({name, base})", function() {
      var gen = new Generator({name: "test", src: "test/unit/data"});
      gen.must.have({
        name: "test",
        base: "test/unit/data",
        dst: process.cwd(),
        responses: {},
        answers: {}
      });
    });

    it("constructor(opts, responses)", function() {
      var gen = new Generator({name: "test", src: "test/unit/data"}, {one: 1, two: 2});

      gen.must.have({
        name: "test",
        base: "test/unit/data",
        dst: process.cwd(),
        responses: {one: 1, two: 2},
        answers: {}
      });
    });
  });

  describe("Inquire", function() {
    describe("With answer using parameter", function() {
      var gen;

      it("confirm() - parameter is true as string", function() {
        gen = new Generator({name: "test", src: "test/unit/data/"}, {
          test: "true"
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(true);
      });

      it("confirm() - parameter is yes", function() {
        gen = new Generator({name: "test", src: "test/unit/data/"}, {
          test: "yes"
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(true);
      });

      it("confirm() - parameter is true as boolean", function() {
        gen = new Generator({name: "test", src: "test/unit/data/"}, {
          test: true
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(true);
      });

      it("confirm() - parameter is false", function() {
        gen = new Generator({name: "test", src: "test/unit/data/"}, {
          test: "false"
        });

        gen.confirm({name: "test", title: "Testing", default: false}).must.be.eq(false);
      });
    });

    describe("With default answers", function() {
      var gen;

      beforeEach(function() {
        gen = new Generator({name: "test", src: "test/unit/data/"}, {
          confirm: true,
          input: "elvisc",
          password: "costello",
          checkbox: ["one", "three"],
          list: "two"
        });
      });

      it("confirm()", function() {
        var res;

        res = gen.confirm({name: "confirm", title: "Is it OK?", default: false});
        res.must.be.eq(true);
        gen.answers.confirm.must.be.eq(true);
      });

      it("input()", function() {
        var res;

        res = gen.input({name: "input", title: "Username", default: "ecostello"});
        res.must.be.eq("elvisc");
        gen.answers.input.must.be.eq("elvisc");
      });

      it("password()", function() {
        var res;

        res = gen.password({name: "password", title: "Password"});
        res.must.be.eq("costello");
        gen.answers.password.must.be.eq("costello");
      });

      it("#checkbox()", function() {
        var res;

        res = gen.checkbox({name: "checkbox", title: "Check", choices: ["one", "two", "three"]});
        res.must.be.eq(["one", "three"]);
        gen.answers.checkbox.must.be.eq(["one", "three"]);
      });

      it("#list()", function() {
        var res;

        res = gen.list({name: "list", title: "List", choices: ["one", "two", "three"]});
        res.must.be.eq("two");
        gen.answers.list.must.be.eq("two");
      });
    });

    if (process.env.TRAVIS != "true") {
      describe("Without default answers", function() {
        var gen;

        beforeEach(function() {
          gen = new Generator({name: "test"});
        });

        it("confirm()", function() {
          var res;

          res = gen.confirm({name: "confirm", title: "Confirm (response: y)?", default: false});
          res.must.be.eq(true);
          gen.answers.confirm.must.be.eq(true);
        });

        it("input()", function() {
          var res;

          res = gen.input({name: "input", title: "Username (response: elvisc)", default: "ecostello"});
          res.must.be.eq("elvisc");
          gen.answers.input.must.be.eq("elvisc");
        });

        it("password()", function() {
          var res;

          res = gen.password({name: "password", title: "Password (response: costello)"});
          res.must.be.eq("costello");
          gen.answers.password.must.be.eq("costello");
        });

        it("#checkbox()", function() {
          var res;

          res = gen.checkbox({name: "checkbox", title: "Check (response: one, three)", choices: ["one", "two", "three"]});
          res.must.be.eq(["one", "three"]);
          gen.answers.checkbox.must.be.eq(["one", "three"]);
        });

        it("#checkbox() - none checked", function() {
          var res;

          res = gen.checkbox({name: "checkbox", title: "Check (response: INTRO)", choices: ["one", "two", "three"]});
          res.must.be.eq([]);
          gen.answers.checkbox.must.be.eq([]);
        });

        it("#list()", function() {
          var res;

          res = gen.list({name: "list", title: "List (response: two)", choices: ["one", "two", "three"]});
          res.must.be.eq("two");
          gen.answers.list.must.be.eq("two");
        });
      });
    }
  });

  describe("Generation", function() {
    var gen, DST;

    beforeEach(function() {
      DST = new fs.Dir(fs.Dir.TMP_DIR, Date.now());
      DST.create();

      gen = new Generator({name: "test", src: "test/unit/data/", dst: DST.path});
    });

    afterEach(function() {
      DST.remove();
    });

    describe("#cli()", function() {
      it("cli() - existing command", function() {
        gen.cli({cmd: "node", args: ["-e", "console.log('bonjour')"], wd: "."}).must.be.eq(0);
      });

      it("cli() - nonexisting command", function() {
        gen.cli({cmd: "unknowncommand", args: [], wd: "."}).must.not.be.eq(0);
      });
    });

    describe("#mkdir()", function() {
      it("mkdir() - dir not existing", function() {
        gen.mkdir("test1");
        dir(DST.path, "test1").must.exist();
      });

      it("mkdir() - dir existing", function() {
        gen.mkdir("test2");
        dir(DST.path, "test2").must.exist();
        gen.mkdir("test2");
        dir(DST.path, "test2").must.exist();
      });
    });

    describe("#copy()", function() {
      it("copy(file) - file existing", function() {
        gen.copy("static/file.json");
        file(DST.path, "static/file.json").must.exist();
      });

      it("copy(file, alias) - file existing", function() {
        gen.copy("static/file.json", "f.json");
        file(DST.path, "static/f.json").must.exist();
      });

      it("copy(dir) - dir existing", function() {
        gen.copy("static");
        dir(DST.path, "static").must.exist();
        file(DST.path, "static/file.json").must.exist();
        file(DST.path, "static/file.txt").must.exist();
      });

      it("copy(dir, alias) - dir existing", function() {
        gen.copy("static", "stat");
        dir(DST.path, "stat").must.exist();
        file(DST.path, "stat/file.json").must.exist();
        file(DST.path, "stat/file.txt").must.exist();
      });

      it("copy(entry) - entry not existing", function() {
        gen.copy.must.raise(Error, ["static/unknown.txt"]);
      });
    });

    describe("#remove()", function() {
      beforeEach(function() {
        gen.copy("static", "stat");
      });

      it("remove() - entry existing", function() {
        dir(DST.path, "stat").must.exist();
        gen.remove("stat");
        dir(DST.path, "stat").must.not.exist();
      });

      it("remove() - entry existing", function() {
        gen.remove("unknownentry");
        dir(DST.path, "unknownentry").must.not.exist();
      });
    });
  });
});
