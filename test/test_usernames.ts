import { describe } from "mocha";
import { ExecException, exec } from "child_process";
import { expect } from "chai";

describe("Usernames validator", () => {
  describe("should be valid users", () => {
    const validUsernames = [
      {
        username: "Beltan",
        address: "0x279194707061E021c550D1263dF57E0aff8dBfd6",
        chainId: 16,
      },
      {
        username: "LukaAvbreht",
        address: "0x279194707061E021c550D1263dF57E0aff8dBfd6",
        chainId: 16,
      },
    ];

    for (const validUser of validUsernames) {
      let capturedError: ExecException | null;
      let capturedStdout: string;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_username -u ${validUser.username} -a ${validUser.address} -c ${validUser.chainId}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStdout = stdout;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`should validate ${validUser.username} with address ${validUser.address} on chain ${validUser.chainId}`, () => {
        expect(capturedError).to.be.null;
        const splitStdout = capturedStdout.split("\n");
        expect(splitStdout[splitStdout.length - 2]).to.equal("Authorised user");
        expect(capturedStderr).to.be.empty;
      });
    }
  });

  describe("should be invalid users", () => {
    const invalidUsernames = [
      {
        username: "randomUser",
        address: "0x279194707061E021c550D1263dF57E0aff8dBfd6",
        chainId: 16,
      },
    ];

    for (const invalidUser of invalidUsernames) {
      let capturedError: ExecException | null;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_username -u ${invalidUser.username} -a ${invalidUser.address} -c ${invalidUser.chainId}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`should fail ${invalidUser.username} with address ${invalidUser.address} on chain ${invalidUser.chainId}`, () => {
        expect(capturedError).not.to.be.null;
        expect(capturedStderr).not.to.be.empty;
        if (capturedError) {
          const errorSplit = capturedError.message.split("\n");
          const errorSplit2 = errorSplit[1].split("Error: ");
          expect(errorSplit2[2]).to.eq(
            `Unauthorised user for address ${invalidUser.address} on chain ${invalidUser.chainId}`
          );
        }
      });
    }
  });
});
