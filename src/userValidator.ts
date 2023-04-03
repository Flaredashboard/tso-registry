import axios, { AxiosResponse } from "axios";
import Web3 from "web3";
import yargs from "yargs";

async function getUserIdFromUsername(username: string): Promise<any> {
  try {
    const response: AxiosResponse = await axios.get(
      `https://api.github.com/users/${username}`
    );

    const user = response.data;
    return String(user.id);
  } catch (error) {
    throw new Error(`Something went wrong: ${error}`);
  }
}

async function checkIdWithSmartContract(id: string, address: string) {
  const web3 = new Web3("https://coston-api.flare.network/ext/bc/C/rpc");

  const contractJson = require(`./../artifacts/contracts/TsoGithubRegistry.sol/TsoGithubRegistry.json`);

  const contract = new web3.eth.Contract(
    contractJson.abi,
    "0x8ef1dD7abda8e7FAB4d347ef916F7e3F6292A29B"
  );

  await contract.methods
    .getTsoGitlabUsers(address)
    .call()
    .then((response: any) => {
      if (response.includes(id)) {
        console.log("Authorised user");
        return true;
      }
      throw new Error(`Unauthorised user for address ${address}`);
    })
    .catch((error: any) => {
      throw new Error(error);
    });
}

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
  });

// @ts-ignore
const { username, address } = argv;

getUserIdFromUsername(username).then((id) => {
  checkIdWithSmartContract(id, address)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
});
