import { describe } from "mocha";
import { exec, ExecException } from "child_process";
import { expect } from "chai";

describe("Provider validator", () => {
  describe("should be valid files", () => {
    const validFiles = [
      "test/test_providers/test_OK_both_chains.json",
      "test/test_providers/test_OK_sgb_only.json",
      "test/test_providers/test_OK_min_info.json",
    ];

    for (const validFile of validFiles) {
      let capturedError: ExecException | null;
      let capturedStdout: string;
      let capturedStderr: string;

      before(function (done) {
        exec(`yarn validate_provider ${validFile}`, (error, stdout, stderr) => {
          capturedError = error;
          capturedStdout = stdout;
          capturedStderr = stderr;
          done();
        });
      });

      it(`should validate ${validFile}`, () => {
        expect(capturedError).to.be.null;
        const splitStdout = capturedStdout.split("\n");
        expect(splitStdout[splitStdout.length - 2]).to.equal(
          "Valid format of TSO provider file"
        );
        expect(capturedStderr).to.be.empty;
      });
    }
  });

  describe("should be invalid files", () => {
    const invalidFiles = [
      "test/test_providers/test_KO_no_chain.json",
      "test/test_providers/test_KO_bad_structure.json",
      "test/test_providers/test_KO_bad_chain_id.json",
      "test/test_providers/test_KO_bad_percentage.json",
      "test/test_providers/test_KO_bad_url.json",      
      "test/test_providers/test_KO_bad_address.json",
    ];

    for (const invalidFile of invalidFiles) {
      let capturedError: ExecException | null;
      let capturedStderr: string;

      before(function (done) {
        exec(`yarn validate_provider ${invalidFile}`, (error, stdout, stderr) => {
          capturedError = error;
          capturedStderr = stderr;
          done();
        });
      });

      it(`should fail ${invalidFile}`, () => {
        expect(capturedError).not.to.be.null;
        expect(capturedStderr).not.to.be.empty;
        if (capturedError) {
          const errorSplit = capturedError.message.split("\n");
          expect(errorSplit[1]).to.eq(
            `Error: Invalid format of TSO provider file "${invalidFile}"`
          );
        }
      });
    }
  });
});
