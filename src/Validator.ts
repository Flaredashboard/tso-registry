import axios, { AxiosResponse } from "axios";
import Ajv from "ajv";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

export class Validator {
  registryAddress = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";
  githubConfig = process.env.GITHUB_API_TOKEN
    ? {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_API_TOKEN}`,
        },
      }
    : { headers: {} };
  flareConfig = {
    headers: {
      "x-apikey": process.env.FLARE_API_KEY,
    },
  };

  private getRpcFromChainId(chainId: number) {
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

  private getApiEndpointFromChainId(chainId: number) {
    switch (chainId) {
      case 14:
        return "https://api.flare.network/flare-explorer/api";
      case 16:
        return "https://api.flare.network/coston-explorer/api";
      case 19:
        return "https://api.flare.network/songbird-explorer/api";
      case 114:
        return "https://api.flare.network/coston2-explorer/api";
      default:
        throw new Error(`Invalid chain id: ${chainId}`);
    }
  }

  private appendParametersToUrl(url: string, params: Object) {
    let endpoint = new URL(url);

    for (const [key, value] of Object.entries(params)) {
      endpoint.searchParams.set(key, value);
    }

    return endpoint.toString();
  }

  private async checkProviderIsWhitelisted(chainId: number, address: string) {
    const assets = await this.getSupportedAssets(chainId);

    for (const asset of assets) {
      let providers = await this.getWhitelistedProvidersForAsset(
        chainId,
        asset
      );
      if (providers.includes(address)) return true;
    }

    throw new Error(`Address is not whitelisted for any asset`);
  }

  private async getWhitelistedProvidersForAsset(
    chainId: number,
    asset: string
  ) {
    try {
      const address = await this.getAddressFromContractName(
        chainId,
        "VoterWhitelister"
      );
      const contract = await this.createContract(chainId, address);

      return await contract.methods
        .getFtsoWhitelistedPriceProvidersBySymbol(asset)
        .call();
    } catch (error) {
      throw new Error(
        `getWhitelistedProvidersForAsset ${asset} failed: ${error}`
      );
    }
  }

  async getSupportedAssets(chainId: number) {
    try {
      const address = await this.getAddressFromContractName(
        chainId,
        "FtsoRegistry"
      );
      const contract = await this.createContract(chainId, address);

      return await contract.methods.getSupportedSymbols().call();
    } catch (error) {
      throw new Error(`getSupportedAssets failed: ${error}`);
    }
  }

  private async createContract(chainId: number, address: string) {
    const rpc = this.getRpcFromChainId(chainId);
    const web3 = new Web3(rpc);

    let params = {
      address: address,
      module: "contract",
      action: "getabi",
    };

    try {
      let isProxy = false;
      let abi = await this.getAbi(chainId, params);

      for (let method of abi) {
        if (
          method.stateMutability === "view" &&
          method.name === "implementation"
        ) {
          isProxy = true;
          break;
        }
      }

      if (isProxy) {
        const proxyAddress = await new web3.eth.Contract(abi, address).methods
          .implementation()
          .call();

        params.address = proxyAddress;
        abi = await this.getAbi(chainId, params);
      }

      return new web3.eth.Contract(abi, address);
    } catch (error) {
      throw error;
    }
  }

  private async getAbi(chainId: number, params: Object): Promise<AbiItem[]> {
    const endpoint = this.getApiEndpointFromChainId(chainId);
    const url = this.appendParametersToUrl(endpoint, params);

    try {
      const response = await axios.get(url, this.flareConfig);
      return JSON.parse(response.data.result);
    } catch (error) {
      throw error;
    }
  }

  private async getAddressFromContractName(
    chainId: number,
    contractName: string
  ) {
    try {
      const registryContract = await this.getRegistry(chainId);
      return await registryContract.methods
        .getContractAddressByName(contractName)
        .call();
    } catch (error) {
      throw new Error(`getAddressFromContractName failed: ${error}`);
    }
  }

  private async getRegistry(chainId: number) {
    try {
      return await this.createContract(chainId, this.registryAddress);
    } catch (error) {
      throw new Error(`getRegistry failed: ${error}`);
    }
  }

  private getAddressesFromFile(file: any) {
    let addresses = [];
    if ("ftso_info" in file) {
      addresses.push(file.ftso_info.address);
    }
    if ("stso_info" in file) {
      addresses.push(file.stso_info.address);
    }

    return addresses;
  }

  private isAddressDuplicated(dir: string, filename: string) {
    const originalFile = JSON.parse(
      fs.readFileSync(filename, { encoding: "utf8", flag: "r" })
    );
    const originalAddresses = this.getAddressesFromFile(originalFile);

    let duplicated = false;
    fs.readdirSync(dir).forEach((name) => {
      if (filename === dir.concat(`/${name}`)) return;
      if (path.parse(name).ext !== ".json") return;

      const file = JSON.parse(
        fs.readFileSync(path.resolve(dir, name), {
          encoding: "utf8",
          flag: "r",
        })
      );

      const addresses = this.getAddressesFromFile(file);
      const intersection = originalAddresses.filter((value) =>
        addresses.includes(value)
      );

      if (intersection.length !== 0) duplicated = true;
    });

    return duplicated;
  }

  public async validateFileDeletion(username: string, filename: string) {
    const addressName = path.basename(filename, ".json");

    try {
      const userId = await this.getUserIdFromUsername(username);
      const promises = [
        this.checkIdWithSmartContract(userId, addressName, 14),
        this.checkIdWithSmartContract(userId, addressName, 16),
        this.checkIdWithSmartContract(userId, addressName, 19),
        this.checkIdWithSmartContract(userId, addressName, 114),
      ];
      const data = await Promise.allSettled(promises);

      for (const item of data) {
        if (item.status === "fulfilled") return true;
      }
      throw new Error(
        `User ${username} does not have authorization to delete ${filename}`
      );
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async validateAddressesFromFile(username: string, filename: string) {
    const file = JSON.parse(
      fs.readFileSync(filename, { encoding: "utf8", flag: "r" })
    );

    if (this.isAddressDuplicated(path.dirname(filename), filename)) {
      throw new Error(
        `File ${filename} contains a conflicting address with another file`
      );
    }

    const addressName = path.basename(filename, ".json");
    let addressNameValidated = false;

    try {
      const userId = await this.getUserIdFromUsername(username);

      if ("ftso_info" in file) {
        if (addressName === file.ftso_info.address) {
          addressNameValidated = true;
        } else {
          throw new Error("Filename address does not match FTSO");
        }

        await this.checkIdWithSmartContract(
          userId,
          file.ftso_info.address,
          file.ftso_info.chainId
        );

        await this.checkProviderIsWhitelisted(
          file.ftso_info.chainId,
          file.ftso_info.address
        );
      }
      if ("stso_info" in file) {
        if (!addressNameValidated && addressName === file.stso_info.address) {
          addressNameValidated = true;
        } else {
          throw new Error("Filename address does not match STSO");
        }

        await this.checkIdWithSmartContract(
          userId,
          file.stso_info.address,
          file.stso_info.chainId
        );

        await this.checkProviderIsWhitelisted(
          file.stso_info.chainId,
          file.stso_info.address
        );
      }
    } catch (error: any) {
      throw new Error(error);
    }

    return addressNameValidated;
  }

  public async getUserIdFromUsername(username: string): Promise<any> {
    try {
      const response: AxiosResponse = await axios.get(
        `https://api.github.com/users/${username}`,
        this.githubConfig
      );

      const user = response.data;
      return String(user.id);
    } catch (error) {
      throw new Error(`Something went wrong: ${error}`);
    }
  }

  public async checkIdWithSmartContract(
    id: string,
    address: string,
    chainId: number
  ) {
    const rpc = this.getRpcFromChainId(chainId);
    const web3 = new Web3(rpc);

    const contractProxyJson = require(`./../artifacts/contracts/proxy/ProxyRegistry.sol/ProxyRegistry.json`);
    const contractImplementationJson = require(`./../artifacts/contracts/TsoGithubRegistry.sol/TsoGithubRegistry.json`);

    const contractProxy = new web3.eth.Contract(
      contractProxyJson.abi,
      "0xda64978ff8f5fAAE13A928d0E6548bc0756205C3"
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
        .getTsoGithubUsers(address)
        .call();

      if (response.includes(id)) {
        console.log("Authorised user");
        return true;
      }

      const pollingAddress = await this.getAddressFromContractName(
        chainId,
        "PollingFtso"
      );
      const pollingContract = await this.createContract(
        chainId,
        pollingAddress
      );

      const proxyAddress = await pollingContract.methods
        .providerToProxy(address)
        .call();

      if (response.includes(proxyAddress)) {
        console.log("Authorised user");
        return true;
      }

      throw new Error(
        `Unauthorised user for address ${address} on chain ${chainId}`
      );
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async validateFileFormat(fileName: string) {
    const ajv = new Ajv();
    const schema = JSON.parse(
      fs.readFileSync("src/singleProviderSchema.json", {
        encoding: "utf8",
        flag: "r",
      })
    );

    if (!fs.existsSync(fileName)) {
      throw new Error(`No such file: "${fileName}"`);
    }

    const data = JSON.parse(
      fs.readFileSync(fileName, { encoding: "utf8", flag: "r" })
    );

    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      console.log("Valid format of TSO provider file");
      return true;
    }

    throw new Error(`Invalid format of TSO provider file "${fileName}"`);
  }
}
