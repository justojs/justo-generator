//imports
const assert = require("assert");
const fs = require("justo-fs");
const file = require("justo-assert-fs").file;
const dir = require("justo-assert-fs").dir;
const HandlebarsGenerator = require("../../../dist/es5/nodejs/justo-generator").HandlebarsGenerator;

//suite
describe("HandlebarsGenerator", function() {
  var gen, DST, DST_DIR;
  const DATA = "test/unit/data/";

  beforeEach(function() {
    DST_DIR = new fs.Dir.createTmpDir();
    DST = DST_DIR.path;

    gen = new HandlebarsGenerator({name: "test", src: DATA, dst: DST});
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

  describe("#templateAsString()", function() {
    it("templateAsString(template)", function() {
      JSON.parse(gen.templateAsString(file(DATA, "handlebars/file.json").text)).must.be.eq({
        name: "",
        version: "",
        author: "Justo Labs",
        homepage: ""
      });
    });

    it("templateAsString(template, scope)", function() {
      JSON.parse(gen.templateAsString(file(DATA, "handlebars/file.json").text, {name: "test", version: "1.0.0"})).must.be.eq({
        name: "test",
        version: "1.0.0",
        author: "Justo Labs",
        homepage: ""
      });
    });

    it("templateAsString(template, scope, opts)", function() {
      gen.templateAsString(
        "{{#if (myhelper scope.x scope.y)}}OK{{/if}}",
        {x: 1, y: 1},
        {
          helpers: {
            myhelper: function(x, y) {
              return (x == y);
            }
          }
        }
      ).must.be.eq("OK");
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

      gen.template("handlebars/helpers/myhelper.hbs", {x: 1, y: 1});
      file(DST, "handlebars/helpers/myhelper.hbs").text.must.be.eq("OK\n");

      gen.template("handlebars/helpers/myhelper.hbs", {x: 1, y: 2});
      file(DST, "handlebars/helpers/myhelper.hbs").text.must.be.eq("\n");
    });

    it("#unregisterHelper()", function() {
      gen.registerHelper("myhelper", function(x, y) {
        return (x == y);
      });

      gen.template("handlebars/helpers/myhelper.hbs", {x: 1, y: 1});
      file(DST, "handlebars/helpers/myhelper.hbs").text.must.be.eq("OK\n");

      gen.unregisterHelper("myhelper");
      gen.template.bind(gen).must.raise(Error, ["handlebars/helpers/myhelper.hbs", {x: 1, y: 1}]);
    });

    it("#template(file, scope, {helpers})", function() {
      gen.template(
        "handlebars/helpers/custom.hbs",
        {x: 1, y: 1},
        {helpers: {test: function(x, y) { return (x == y); }}}
      );

      file(DST, "handlebars/helpers/custom.hbs").text.must.be.eq("OK\n");
      gen.hasHelper("test").must.be.eq(false);
    });

    describe("include", function() {
      var dst;

      beforeEach(function() {
        dst = file(DST, "handlebars/helpers/include.hbs");
      });

      it("include file", function() {
        gen.template("handlebars/helpers/include.hbs");
        dst.must.exist();
        dst.text.must.be.eq("Hello Justo\nThis is an example\n");
      });
    });
  });

});
