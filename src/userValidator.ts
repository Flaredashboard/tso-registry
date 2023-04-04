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

  const contractProxyJson = require(`./../artifacts/contracts/proxy/ProxyRegistry.sol/ProxyRegistry.json`);
  const contractImplementationJson = require(`./../artifacts/contracts/TsoGithubRegistry.sol/TsoGithubRegistry.json`);

  const contractProxy = new web3.eth.Contract(
    contractProxyJson.abi,
    "0x16d6263932C4429EB6132536fb27492C8d83cA12"
  );

  const implementationAddress = await contractProxy.methods
    .implementation()
    .call()
    .catch((error: any) => {
      throw new Error(error);
    });

  const contractImplementation = new web3.eth.Contract(
    contractImplementationJson.abi,
    implementationAddress
  );

  await contractImplementation.methods
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
