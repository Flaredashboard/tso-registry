import Ajv from "ajv";
import yargs, { Argv } from "yargs";
import * as fs from "fs"

async function validateMain(fileName: string) {
  const ajv = new Ajv();
  const schema = JSON.parse(fs.readFileSync("src/singleProviderSchema.json", {encoding:'utf8', flag:'r'}))

  // console.log(schema)
  if(!fs.existsSync(fileName)){
    throw new Error(`No such file: "${fileName}"`)
  }

  const data =  JSON.parse(fs.readFileSync(fileName, {encoding:'utf8', flag:'r'}))

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (valid) {
    console.log("Valid format of TSO provider file");
    return true;
  }
  // console.log(validate.errors);
  throw new Error(`Invalid format of TSO provider file "${fileName}"`)

}

const { argv } = yargs.scriptName("Validate provider file").option("f", {
  alias: "provider-file",
  describe: "Path to provider file",
  demandOption: "Provider file is required",
  type: "string",
  nargs: 1,
});

// @ts-ignore
const { providerFile } = argv;

validateMain(providerFile)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
