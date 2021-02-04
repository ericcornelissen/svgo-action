export const ActionConfig = jest.fn()
  .mockImplementation(() => ({
    commit: true,
    commitBody: "Optimized SVGs:\n{{fileList}}",
    commitTitle: "Optimize {{optimizedCount}} SVG(s) with SVGO",
    ignoreGlob: "",
    isDryRun: false,
    svgoOptionsPath: "404",
  }))
  .mockName("inputs.ActionConfig");
