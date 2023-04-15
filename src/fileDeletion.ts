import yargs from "yargs";
import { Validator } from "./Validator";

const { argv } = yargs
  .scriptName("Validate file deletion")
  .option("u", {
    alias: "username",
    describe: "Username of Github",
    demandOption: "Username is required",
    type: "string",
    nargs: 1,
  })
  .option("f", {
    alias: "filename",
    describe: "Path to provider file",
    demandOption: "Provider file is required",
    type: "string",
    nargs: 1,
  });

// @ts-ignore
const { username, filename } = argv;

new Validator()
  .validateFileDeletion(username, filename)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
