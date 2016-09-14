//imports
const justo = require("justo");
const suite = justo.suite;
const test = justo.test;
const pkg = require("../../dist/es5/nodejs/justo-generator");

//suite
suite("index", function() {
  test("Generator", function() {
    pkg.Generator.must.be.instanceOf(Function);
  });

  test("Handlebars", function() {
    pkg.HandlebarsGenerator.must.be.instanceOf(Function);
  });
})();
