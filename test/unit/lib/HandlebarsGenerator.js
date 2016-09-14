//imports
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const init = justo.init;
const fin = justo.fin;
const fs = require("justo-fs");
const file = require("justo-assert-fs").file;
const HandlebarsGenerator = require("../../../dist/es5/nodejs/justo-generator").HandlebarsGenerator;

//suite
suite("HandlebarsGenerator", function() {
  var gen, DST, DST_DIR;
  const DATA = "test/unit/data/";

  init("*", function() {
    DST_DIR = new fs.Dir.createTmpDir();
    DST = DST_DIR.path;

    gen = new HandlebarsGenerator({mute: true, name: "test", src: DATA, dst: DST});
  });

  fin("*", function() {
    DST_DIR.remove();
  });

  suite("#template()", function() {
    test("template(file)", function() {
      var dst = file(DST, "handlebars/file.json");

      gen.template("handlebars/file.json");
      dst.must.exist();
      dst.json.must.be.eq({name: "", version: "", author: "Justo Labs", homepage: ""});
    });

    test("template(file, scope)", function() {
      var dst = file(DST, "handlebars/file.json");

      gen.template("handlebars/file.json", {name: "test", version: "1.0.0"});
      dst.must.exist();
      dst.json.must.be.eq({name: "test", version: "1.0.0", author: "Justo Labs", homepage: ""});
    });

    test("template(file, alias, scope)", function() {
      var dst = file(DST, "handlebars/f.json");

      gen.template("handlebars/file.json", "f.json", {name: "test", version: "1.0.0", author: "Justo Labs"});
      dst.must.exist();
      dst.json.must.be.eq({name: "test", version: "1.0.0", author: "Justo Labs", homepage: ""});
    });
  });

  suite("#templateAsString()", function() {
    test("templateAsString(file)", function() {
      JSON.parse(gen.templateAsString("/handlebars/file.json")).must.be.eq({
        name: "",
        version: "",
        author: "Justo Labs",
        homepage: ""
      });
    });

    test("templateAsString(file, scope)", function() {
      JSON.parse(gen.templateAsString("/handlebars/file.json", {name: "test", version: "1.0.0"})).must.be.eq({
        name: "test",
        version: "1.0.0",
        author: "Justo Labs",
        homepage: ""
      });
    });

    test("templateAsString(file, scope, opts)", function() {
      gen.templateAsString(
        "/handlebars/helpers/myhelper.hbs",
        {x: 1, y: 1},
        {
          helpers: {
            myhelper: function(x, y) {
              return (x == y);
            }
          }
        }
      ).must.be.eq("OK\n");
    });
  });

  suite("Partials", function() {
    test("#registerPartial()", function() {
      gen.registerPartial("mypartial", "<b>{{msg}}</b>");
      gen.template("handlebars/partial/partial.txt", {msg: "OK"});
      file(DST, "handlebars/partial/partial.txt").text.must.be.eq("<b>OK</b>");
      gen.unregisterPartial("mypartial");
    });

    test("#registerPartialFromFile()", function() {
      gen.registerPartialFromFile("mypartial", "handlebars/partial/mypartial.txt");
      gen.template("handlebars/partial/partial.txt", {msg: "OK"});
      file(DST, "handlebars/partial/partial.txt").text.must.be.eq("<b>OK</b>\n");
    });

    test("#unregisterPartial()", function() {
      gen.registerPartial("mypartial", "<b>{{msg}}</b>");
      gen.hasPartial("mypartial").must.be.eq(true);

      gen.template("handlebars/partial/partial.txt", {msg: "OK"});
      file(DST, "handlebars/partial/partial.txt").text.must.be.eq("<b>OK</b>");

      gen.unregisterPartial("mypartial");
      gen.hasPartial("mypartial").must.be.eq(false);
    });

    test("#template(file, scope, {partials})", function() {
      gen.template(
        "handlebars/partial/custom.txt",
        {msg: "OK"},
        {partials: {test: "<b>{{msg}}</b>"}}
      );

      file(DST, "handlebars/partial/custom.txt").text.must.be.eq("<b>OK</b>");
      gen.hasPartial("test").must.be.eq(false);
    });
  });

  suite("Helpers", function() {
    test("#registerHelper()", function() {
      gen.registerHelper("myhelper", function(x, y) {
        return (x == y);
      });

      gen.template("handlebars/helpers/myhelper.hbs", {x: 1, y: 1});
      file(DST, "handlebars/helpers/myhelper.hbs").text.must.be.eq("OK\n");

      gen.template("handlebars/helpers/myhelper.hbs", {x: 1, y: 2});
      file(DST, "handlebars/helpers/myhelper.hbs").text.must.be.eq("\n");
    });

    test("#unregisterHelper()", function() {
      gen.registerHelper("myhelper", function(x, y) {
        return (x == y);
      });

      gen.template("handlebars/helpers/myhelper.hbs", {x: 1, y: 1});
      file(DST, "handlebars/helpers/myhelper.hbs").text.must.be.eq("OK\n");

      gen.unregisterHelper("myhelper");
      gen.template.bind(gen).must.raise(Error, ["handlebars/helpers/myhelper.hbs", {x: 1, y: 1}]);
    });

    test("#template(file, scope, {helpers})", function() {
      gen.template(
        "handlebars/helpers/custom.hbs",
        {x: 1, y: 1},
        {helpers: {test: function(x, y) { return (x == y); }}}
      );

      file(DST, "handlebars/helpers/custom.hbs").text.must.be.eq("OK\n");
      gen.hasHelper("test").must.be.eq(false);
    });

    suite("include", function() {
      var dst;

      init("*", function() {
        dst = file(DST, "handlebars/helpers/include.hbs");
      });

      test("include file", function() {
        gen.template("handlebars/helpers/include.hbs");
        dst.must.exist();
        dst.text.must.be.eq("Hello Justo\nThis is an example\n");
      });
    });
  });
})();
