import * as core from "@actions/core";
import * as github from "@actions/github";

async function main() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const configPath = core.getInput("configuration-path", { required: false });
    core.debug("I work!");
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

main();
