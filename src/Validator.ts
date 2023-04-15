import axios, { AxiosResponse } from "axios";
import Ajv from "ajv";
import Web3 from "web3";
import path from "path";
import * as fs from "fs";

export class Validator {
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
      throw new Error(`User ${username} does not have authorization to delete ${filename}`);
    } catch (error: any) {
      throw new Error(error);
    }
  }

  public async validateAddressesFromFile(username: string, filename: string) {
    const file = JSON.parse(
      fs.readFileSync(filename, { encoding: "utf8", flag: "r" })
    );

    // 10 (containing folder) + 42 address + 5 suffix (.json)
    if (filename.length !== 57) {
      throw new Error("Filename is not valid");
    }

    if (!filename.startsWith("providers/")) {
      throw new Error("Filename is not inside providers folder");
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
      }
      if ("coston_info" in file) {
        if (!addressNameValidated && addressName === file.coston_info.address) {
          addressNameValidated = true;
        } else {
          throw new Error("Filename address does not match Coston");
        }

        await this.checkIdWithSmartContract(
          userId,
          file.coston_info.address,
          file.coston_info.chainId
        );
      }
      if ("coston2_info" in file) {
        if (
          !addressNameValidated &&
          addressName === file.coston2_info.address
        ) {
          addressNameValidated = true;
        } else {
          throw new Error("Filename address does not match Coston2");
        }

        await this.checkIdWithSmartContract(
          userId,
          file.coston2_info.address,
          file.coston2_info.chainId
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
        `https://api.github.com/users/${username}`
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
