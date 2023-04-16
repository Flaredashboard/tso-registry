import { describe } from "mocha";
import { ExecException, exec } from "child_process";
import { expect } from "chai";

describe("Address validation", () => {
  describe("should be files with valid addresses", () => {
    const validFiles = [
      {
        username: "Beltan",
        file: "test/test_file_addresses/0x279194707061E021c550D1263dF57E0aff8dBfd6.json",
      },
      {
        username: "LukaAvbreht",
        file: "test/test_file_addresses/0x279194707061E021c550D1263dF57E0aff8dBfd6.json",
      },
    ];

    for (const validFile of validFiles) {
      let capturedError: ExecException | null;
      let capturedStdout: string;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_file_addresses -u ${validFile.username} -f ${validFile.file}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStdout = stdout;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`File ${validFile.file} has valid addresses`, () => {
        expect(capturedError).to.be.null;
        const splitStdout = capturedStdout.split("\n");
        expect(splitStdout[splitStdout.length - 2]).to.equal("Authorised user");
        expect(capturedStderr).to.be.empty;
      });
    }
  });

  describe("should be files with invalid addresses", () => {
    const invalidFiles: any = [
      {
        username: "Beltan",
        file: "test/test_file_addresses/0x479194707061E021c550D1263dF57E0aff8dBfd6.json",
      },
      {
        username: "LukaAvbreht",
        file: "test/test_file_addresses/0x579194707061E021c550D1263dF57E0aff8dBfd6.json",
      },
    ];

    for (const invalidFile of invalidFiles) {
      let capturedError: ExecException | null;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_file_addresses -u ${invalidFile.username} -f ${invalidFile.file}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`File ${invalidFile.file} has invalid addresses`, () => {
        expect(capturedError).not.to.be.null;
        expect(capturedStderr).not.to.be.empty;
        if (capturedError) {
          const errorSplit = capturedError.message.split("\n");
          expect(errorSplit[1]).to.eq(
            `Error: File ${invalidFile.file} contains a conflicting address with another file`
          );
        }
      });
    }
  });

  describe("should be not whitelisted", () => {
    const invalidFiles: any = [
      {
        username: "Beltan",
        file: "test/test_file_addresses/0x96388288fa6d80cba355b38b7D9BFB4A94306Ab4.json",
      },
    ];

    for (const invalidFile of invalidFiles) {
      let capturedError: ExecException | null;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_file_addresses -u ${invalidFile.username} -f ${invalidFile.file}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`Address in file ${invalidFile.file} is not whitelisted`, () => {
        expect(capturedError).not.to.be.null;
        expect(capturedStderr).not.to.be.empty;
        if (capturedError) {
          const errorSplit = capturedError.message.split("\n");
          const errorSplit2 = errorSplit[1].split("Error: ");
          expect(errorSplit2[2]).to.eq(
            `Address is not whitelisted for any asset`
          );
        }
      });
    }
  });
});
