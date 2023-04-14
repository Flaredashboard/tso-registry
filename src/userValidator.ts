import axios, { AxiosResponse } from "axios";
import Web3 from "web3";
import yargs from "yargs";

function getRpcFromChainId(chainId: number) {
  switch (chainId) {
    case 14:
      return "https://flare-api.flare.network/ext/C/rpc";
    case 16:
      return "https://coston-api.flare.network/ext/C/rpc";
    case 19:
      return "https://songbird-api.flare.network/ext/C/rpc";
    case 114:
      return "https://coston2-api.flare.network/ext/C/rpc";
    default:
      throw new Error(`Invalid chain id: ${chainId}`);
  }
}

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

async function checkIdWithSmartContract(
  id: string,
  address: string,
  chainId: number
) {
  const rpc = getRpcFromChainId(chainId);
  const web3 = new Web3(rpc);

  const contractProxyJson = require(`./../artifacts/contracts/proxy/ProxyRegistry.sol/ProxyRegistry.json`);
  const contractImplementationJson = require(`./../artifacts/contracts/TsoGithubRegistry.sol/TsoGithubRegistry.json`);

  const contractProxy = new web3.eth.Contract(
    contractProxyJson.abi,
    "0x16d6263932C4429EB6132536fb27492C8d83cA12"
  );

  try {
    const implementationAddress = await contractProxy.methods
      .implementation()
      .call();

    const contractImplementation = new web3.eth.Contract(
      contractImplementationJson.abi,
      implementationAddress
    );

    const response = await contractImplementation.methods
      .getTsoGitlabUsers(address)
      .call();

    if (response.includes(id)) {
      console.log("Authorised user");
      return true;
    }
    throw new Error(`Unauthorised user for address ${address} on chain ${chainId}`);
  } catch (error: any) {
    throw new Error(error);
  }
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

getUserIdFromUsername(username).then((id) => {
  checkIdWithSmartContract(id, address, chainId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
});
