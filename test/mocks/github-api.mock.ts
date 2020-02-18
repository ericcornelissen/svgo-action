import * as github from "./@actions/github.mock";


const client = new github.GitHub();


export const commitFile = jest.fn()
  .mockImplementation(async () => ({
    sha: "b7d615e1cc52b25023c4bd1cbad1a2ce246009cd",
    url: "https://github.com/ericcornelissen/svgo-action/commit/b7d615e1cc52b25023c4bd1cbad1a2ce246009cd",
  }))
  .mockName("github-api.commitFile");

export const getPrFile = jest.fn()
  .mockImplementation(async (_, path) => {
    const { data } = await client.repos.getContents({ path });

    return {
      path: data.path,
      content: data.content,
      encoding: data.encoding,
    };
  })
  .mockName("github-api.getPrFile");

export const getPrFiles = jest.fn()
  .mockImplementation(async (_, prNumber) => {
    const { data } = await client.pulls.listFiles({
      pull_number: prNumber, /* eslint-disable-line @typescript-eslint/camelcase */
    });

    return data.map(details => ({
      path: details.filename,
      status: details.status,
    }));
  })
  .mockName("github-api.getPrFiles");

export const getPrNumber = jest.fn()
  .mockReturnValue(42)
  .mockName("github-api.getPrNumber");

export const getRepoFile = jest.fn()
  .mockImplementation(async (_, path) => getPrFile(null, path))
  .mockName("github-api.getPrFile");
