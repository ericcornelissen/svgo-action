const payloads = require("../../fixtures/github-payloads");


const PR_WITH_NO_CHANGES = 1;
const PR_WITH_ONE_SVG_CHANGED = 2;


module.exports = {
  context: {
    repo: {
      owner: "pickachu",
      repo: "svgo-action"
    }
  },

  GitHub: jest.fn(() => {
    return {
      pulls: {
        listFiles: ({pull_number}) => {
          if (pull_number === PR_WITH_NO_CHANGES) {
            return Promise.resolve({ data: [] });
          } else if (pull_number === PR_WITH_ONE_SVG_CHANGED) {
            return Promise.resolve({ data: payloads["1 SVG added"] });
          }
        }
      }
    };
  }),
};
