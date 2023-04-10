import { describe } from "mocha";
import { ExecException, exec } from "child_process";
import { expect } from "chai";

describe("Usernames validator", () => {
  describe("should be valid users", () => {
    const validUsernames = {
      Beltan: "0x279194707061E021c550D1263dF57E0aff8dBfd6",
      LukaAvbreht: "0x279194707061E021c550D1263dF57E0aff8dBfd6",
    };

    for (const [username, address] of Object.entries(validUsernames)) {
      let capturedError: ExecException | null;
      let capturedStdout: string;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_username -u ${username} -a ${address}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStdout = stdout;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`should validate ${username} with address ${address}`, () => {
        expect(capturedError).to.be.null;
        const splitStdout = capturedStdout.split("\n");
        expect(splitStdout[splitStdout.length - 2]).to.equal("Authorised user");
        expect(capturedStderr).to.be.empty;
      });
    }
  });

  describe("should be invalid users", () => {
    const invalidUsernames = {
      randomUsername: "0x279194707061E021c550D1263dF57E0aff8dBfd6",
    };

    for (const [username, address] of Object.entries(invalidUsernames)) {
      let capturedError: ExecException | null;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_username -u ${username} -a ${address}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`should fail ${username} with address ${address}`, () => {
        expect(capturedError).not.to.be.null;
        expect(capturedStderr).not.to.be.empty;
        if (capturedError) {
          const errorSplit = capturedError.message.split("\n");
          const errorSplit2 = errorSplit[1].split("Error: ");
          expect(errorSplit2[2]).to.eq(
            `Unauthorised user for address ${address}`
          );
        }
      });
    }
  });
});
