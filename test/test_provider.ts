import { describe } from "mocha";
import { exec } from "child_process";
import { expect } from "chai";

describe("Provider validator", () => {
  describe("should be valid files", () => {
    const validFiles = [
      "test/test_providers/test_aforacle.json",
      "test/test_providers/test_oracle_sgb_only.json",
    ];

    for (const validFile of validFiles) {
      it(`should validate ${validFile}`, () => {
        exec(`yarn validate_provider ${validFile}`, (error, stdout, stderr) => {
          expect(error).to.be.null;
          const splitStdout = stdout.split("\n");
          expect(splitStdout[splitStdout.length - 2]).to.equal(
            "Valid format of TSO provider file"
          );
          expect(stderr).to.be.empty;
        });
      });
    }
  });

  describe("should be invalid files", () => {
    it("should fail if provider does not provide any chain info", () => {
      exec(
        "yarn validate_provider test/test_providers/test_no_chain_FAIL.json",
        (error, stdout, stderr) => {
          expect(error).not.to.be.null;
          expect(stderr).not.to.be.empty;
          if (error) {
            const errorSplit = error.message.split("\n");
            expect(errorSplit[1]).to.eq(
              'Error: Invalid format of TSO provider file "test/test_providers/test_no_chain_FAIL.json"'
            );
          }
        }
      );
    });
  });
});
