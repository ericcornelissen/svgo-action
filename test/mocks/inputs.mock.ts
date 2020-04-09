export const ActionConfig = jest.fn()
  .mockImplementation(() => ({
    commitDescription: "Optimized SVGs:\n{{fileList}}",
    commitTitle: "Optimize {{optimizedCount}} SVG(s) with SVGO",
    ignoredGlob: "",
    isDryRun: false,
    svgoOptionsPath: "404",
  }))
  .mockName("inputs.ActionConfig");

export const getConfigFilePath = jest.fn()
  .mockReturnValue(".github/svgo-action.yml")
  .mockReturnValue("inputs.getConfigFilePath");

export const getRepoToken = jest.fn()
  .mockReturnValue("TOKEN")
  .mockName("inputs.getRepoToken");
