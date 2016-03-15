//import justo package
import justo from "justo";

if (!justo.simple) {
  justo.initialize({
    runner: {
      main: undefined,
      onError: "continue",
      logger: {
        minLevel: "info",
        maxLevel: "fatal"
      }
    }
  });
}

//API
export {default as Generator} from "./lib/Generator";
export {default as HandlebarsGenerator} from "./lib/HandlebarsGenerator";
