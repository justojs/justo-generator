//imports
const pkg = require("../../dist/es5/nodejs/justo-generator");

//suite
describe("index", function() {
  it("Generator", function() {
    pkg.Generator.must.be.instanceOf(Function);
  });

  it("Handlebars", function() {
    pkg.HandlebarsGenerator.must.be.instanceOf(Function);
  });
});
