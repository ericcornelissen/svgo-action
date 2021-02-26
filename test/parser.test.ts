import { parseJavaScript, parseYaml } from "../src/parser";


describe("::parseJavaScript", () => {

  test("valid JavaScript", async () => {
    const result = await parseJavaScript(`
      module.exports = { multipass: true };
    `);
    expect(result).toEqual({ multipass: true });
  });

  test("invalid JavaScript", async () => {
    const result = await parseJavaScript(`
      module--exports: { multipass = true };
    `);
    expect(result).toBeNull();
  });

});

describe("::parseYaml", () => {

  test("valid YAML", async () => {
    const result = await parseYaml(
      "multipass: true\n" +
      "plugins:\n" +
      "  - removeDoctype\n" +
      "",
    );
    expect(result).toEqual({
      multipass: true,
      plugins: [
        "removeDoctype",
      ],
    });
  });

  test("invalid JavaScript", async () => {
    const result = await parseYaml(
      "- removeDoctype\n" +
      "plugins\n" +
      "",
    );
    expect(result).toBeNull();
  });

});
