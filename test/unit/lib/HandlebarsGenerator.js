//imports
const assert = require("assert");
const fs = require("justo-fs");
const file = require("justo-assert-fs").file;
const dir = require("justo-assert-fs").dir;
const HandlebarsGenerator = require("../../../dist/es5/nodejs/justo-generator").HandlebarsGenerator;

//suite
describe("HandlebarsGenerator", function() {
  var gen, DST, DST_DIR;

  beforeEach(function() {
    DST_DIR = new fs.Dir.createTmpDir();
    DST = DST_DIR.path;

    gen = new HandlebarsGenerator({name: "test", src: "test/unit/data/", dst: DST});
  });

  afterEach(function() {
    DST_DIR.remove();
  });

  describe("#template()", function() {
    it("template(file)", function() {
      var dst = file(DST, "handlebars/file.json");

      gen.template("handlebars/file.json");
      dst.must.exist();
      dst.json.must.be.eq({name: "", version: "", author: "Justo Labs", homepage: ""});
    });

    it("template(file, scope)", function() {
      var dst = file(DST, "handlebars/file.json");

      gen.template("handlebars/file.json", {name: "test", version: "1.0.0"});
      dst.must.exist();
      dst.json.must.be.eq({name: "test", version: "1.0.0", author: "Justo Labs", homepage: ""});
    });

    it("template(file, alias, scope)", function() {
      var dst = file(DST, "handlebars/f.json");

      gen.template("handlebars/file.json", "f.json", {name: "test", version: "1.0.0", author: "Justo Labs"});
      dst.must.exist();
      dst.json.must.be.eq({name: "test", version: "1.0.0", author: "Justo Labs", homepage: ""});
    });
  });

  describe("Partials", function() {
    it("#registerPartial()", function() {
      gen.registerPartial("mypartial", "<b>{{msg}}</b>");
      gen.template("handlebars/partial/partial.txt", {msg: "OK"});
      file(DST, "handlebars/partial/partial.txt").text.must.be.eq("<b>OK</b>");
      gen.unregisterPartial("mypartial");
    });

    it("#registerPartialFromFile()", function() {
      gen.registerPartialFromFile("mypartial", "handlebars/partial/mypartial.txt");
      gen.template("handlebars/partial/partial.txt", {msg: "OK"});
      file(DST, "handlebars/partial/partial.txt").text.must.be.eq("<b>OK</b>\n");
    });

    it("#unregisterPartial()", function() {
      gen.registerPartial("mypartial", "<b>{{msg}}</b>");
      gen.hasPartial("mypartial").must.be.eq(true);

      gen.template("handlebars/partial/partial.txt", {msg: "OK"});
      file(DST, "handlebars/partial/partial.txt").text.must.be.eq("<b>OK</b>");

      gen.unregisterPartial("mypartial");
      gen.hasPartial("mypartial").must.be.eq(false);
    });

    it("#template(file, scope, {partials})", function() {
      gen.template(
        "handlebars/partial/custom.txt",
        {msg: "OK"},
        {partials: {test: "<b>{{msg}}</b>"}}
      );

      file(DST, "handlebars/partial/custom.txt").text.must.be.eq("<b>OK</b>");
      gen.hasPartial("test").must.be.eq(false);
    });
  });

  describe("Helpers", function() {
    it("#registerHelper()", function() {
      gen.registerHelper("myhelper", function(x, y) {
        return (x == y);
      });

      gen.template("handlebars/helpers/myhelper.txt", {x: 1, y: 1});
      file(DST, "handlebars/helpers/myhelper.txt").text.must.be.eq("OK\n");

      gen.template("handlebars/helpers/myhelper.txt", {x: 1, y: 2});
      file(DST, "handlebars/helpers/myhelper.txt").text.must.be.eq("\n");
    });

    it("#unregisterHelper()", function() {
      gen.registerHelper("myhelper", function(x, y) {
        return (x == y);
      });

      gen.template("handlebars/helpers/myhelper.txt", {x: 1, y: 1});
      file(DST, "handlebars/helpers/myhelper.txt").text.must.be.eq("OK\n");

      gen.unregisterHelper("myhelper");
      gen.template.bind(gen).must.raise(Error, ["handlebars/helpers/myhelper.txt", {x: 1, y: 1}]);
    });

    it("#template(file, scope, {helpers})", function() {
      gen.template(
        "handlebars/helpers/custom.txt",
        {x: 1, y: 1},
        {helpers: {test: function(x, y) { return (x == y); }}}
      );

      file(DST, "handlebars/helpers/custom.txt").text.must.be.eq("OK\n");
      gen.hasHelper("test").must.be.eq(false);
    });

    describe("in", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/in.txt");
      });

      it("in val array : true", function() {
        gen.template("handlebars/helpers/in.txt", {x: 2, y: [1, 2, 3]});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("in x y : false", function() {
        gen.template("handlebars/helpers/in.txt", {x: 0, y: [3, 2, 1]});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("nin", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/nin.txt");
      });

      it("in val array : true", function() {
        gen.template("handlebars/helpers/nin.txt", {x: 0, y: [1, 2, 3]});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("in x y : false", function() {
        gen.template("handlebars/helpers/nin.txt", {x: 2, y: [3, 2, 1]});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("eq", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/eq.txt");
      });

      it("eq x y : true", function() {
        gen.template("handlebars/helpers/eq.txt", {x: 1, y: 1});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("eq x y : false", function() {
        gen.template("handlebars/helpers/eq.txt", {x: 1, y: 2});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("ne", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/ne.txt");
      });

      it("ne x y : true", function() {
        gen.template("handlebars/helpers/ne.txt", {x: 1, y: 2});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("ne x y : false", function() {
        gen.template("handlebars/helpers/ne.txt", {x: 1, y: 1});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("lt", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/lt.txt");
      });

      it("lt x y : true", function() {
        gen.template("handlebars/helpers/lt.txt", {x: 1, y: 2});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("lt x y : false", function() {
        gen.template("handlebars/helpers/lt.txt", {x: 1, y: 1});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("le", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/le.txt");
      });

      it("lt x y : true", function() {
        gen.template("handlebars/helpers/le.txt", {x: 1, y: 2});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("le x y : false", function() {
        gen.template("handlebars/helpers/le.txt", {x: 1, y: 0});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("gt", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/gt.txt");
      });

      it("gt x y : true", function() {
        gen.template("handlebars/helpers/gt.txt", {x: 1, y: 0});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("gt x y : false", function() {
        gen.template("handlebars/helpers/gt.txt", {x: 1, y: 1});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("ge", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/ge.txt");
      });

      it("ge x y : true", function() {
        gen.template("handlebars/helpers/ge.txt", {x: 1, y: 1});
        dst.must.exist();
        dst.text.must.be.eq("OK\n");
      });

      it("ge x y : false", function() {
        gen.template("handlebars/helpers/ge.txt", {x: 1, y: 2});
        dst.must.exist();
        dst.text.must.be.eq("\n");
      });
    });

    describe("iif", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/iif.txt");
      });

      it("iif true x y", function() {
        gen.template("handlebars/helpers/iif.txt", {cond: true});
        dst.must.exist();
        dst.text.must.be.eq("TRUE\n");
      });

      it("iif false x y", function() {
        gen.template("handlebars/helpers/iif.txt", {cond: false});
        dst.must.exist();
        dst.text.must.be.eq("FALSE\n");
      });
    });

    describe("coalesce", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/coalesce.txt");
      });

      it("coalesce array", function() {
        gen.template("handlebars/helpers/coalesce.txt", {values: [undefined, null, "VALUE1", "VALUE2"]});
        dst.must.exist();
        dst.text.must.be.eq("VALUE1\n");
      });
    });

    describe("include", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/include.txt");
      });

      it("include file", function() {
        gen.template("handlebars/helpers/include.txt");
        dst.must.exist();
        dst.text.must.be.eq("Hello Justo\nThis is an example\n");
      });
    });
  });

});
