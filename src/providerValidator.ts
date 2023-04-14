import yargs from "yargs";
import { Validator } from "./Validator";

const { argv } = yargs.scriptName("Validate provider file format").option("f", {
  alias: "provider-file",
  describe: "Path to provider file",
  demandOption: "Provider file is required",
  type: "string",
  nargs: 1,
});

// @ts-ignore
const { providerFile } = argv;

new Validator()
  .validateFileFormat(providerFile)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
