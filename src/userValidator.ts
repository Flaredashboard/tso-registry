import yargs from "yargs";
import { Validator } from "./Validator";

const { argv } = yargs
  .scriptName("Validate usernames")
  .option("u", {
    alias: "username",
    describe: "Username of Github",
    demandOption: "Username is required",
    type: "string",
    nargs: 1,
  })
  .option("a", {
    alias: "address",
    describe: "Submitting address of TSO",
    demandOption: "Address is required",
    type: "string",
    nargs: 1,
  })
  .option("c", {
    alias: "chainId",
    describe: "Submitting chain of TSO",
    demandOption: "ChainId is required",
    type: "number",
    nargs: 1,
  });

// @ts-ignore
const { username, address, chainId } = argv;

const validator = new Validator();

validator.getUserIdFromUsername(username).then((id) => {
  validator
    .checkIdWithSmartContract(id, address, chainId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
});
