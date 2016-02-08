//imports
const Generator = require("../../dist/es5/nodejs/justo-generator").Generator;

//suite
describe("index", function() {
  it("export Generator", function() {
    Generator.must.be.instanceOf(Function);
  });
});
