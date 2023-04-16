import { describe } from "mocha";
import { ExecException, exec } from "child_process";
import { expect } from "chai";

describe("File deletion", () => {
  describe("should be deleteable files", () => {
    const deleteableFiles = [
      {
        username: "Beltan",
        file: "test/test_file_deletion/0x279194707061E021c550D1263dF57E0aff8dBfd6.json",
      },
      {
        username: "LukaAvbreht",
        file: "test/test_file_deletion/0x279194707061E021c550D1263dF57E0aff8dBfd6.json",
      },
    ];

    for (const deleteableFile of deleteableFiles) {
      let capturedError: ExecException | null;
      let capturedStdout: string;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_file_deletion -u ${deleteableFile.username} -f ${deleteableFile.file}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStdout = stdout;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`user ${deleteableFile.username} can delete file ${deleteableFile.file}`, () => {
        expect(capturedError).to.be.null;
        const splitStdout = capturedStdout.split("\n");
        expect(splitStdout[splitStdout.length - 2]).to.equal("Authorised user");
        expect(capturedStderr).to.be.empty;
      });
    }
  });

  describe("should not be deleteable files", () => {
    const undeleteableFiles: any = [
      {
        username: "randomUsername",
        file: "test/test_file_deletion/0x279194707061E021c550D1263dF57E0aff8dBfd6.json",
      }
    ];

    for (const undeleteableFile of undeleteableFiles) {
      let capturedError: ExecException | null;
      let capturedStderr: string;

      before(function (done) {
        exec(
          `yarn validate_file_deletion -u ${undeleteableFile.username} -f ${undeleteableFile.file}`,
          (error, stdout, stderr) => {
            capturedError = error;
            capturedStderr = stderr;
            done();
          }
        );
      });

      it(`user ${undeleteableFile.username} cannot delete file ${undeleteableFile.file}`, () => {
        expect(capturedError).not.to.be.null;
        expect(capturedStderr).not.to.be.empty;
        if (capturedError) {
          const errorSplit = capturedError.message.split("\n");
          const errorSplit2 = errorSplit[1].split("Error: ");
          expect(errorSplit2[2]).to.eq(
            `User ${undeleteableFile.username} does not have authorization to delete ${undeleteableFile.file}`
          );
        }
      });
    }
  });
});
