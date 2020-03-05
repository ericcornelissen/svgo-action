import { CommitData, formatTemplate } from "../src/templating";

describe("::formatTemplate", () => {

  const defaultTitleTemplate = "foo";
  const defaultMessageTemplate = "bar";
  const defaultData: CommitData = {
    filePaths: ["test.svg", "foo.svg", "bar.svg"],
    optimizedCount: 36,
  };

  describe("Title Templating", () => {

    test.todo("empty template string");

    test.each([
      "there is no templating value in here",
      "This isn't even my final form",
      "Rick Astley - Never gonne give you up",
    ])("no template values", (templateString) => {
      const result = formatTemplate(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(templateString);
    });

    test.each([
      "Optimized SVG(s):\n{{filesList}}",
      "This commit contains optimization for the following SVGs:\n{{ filesList }}",
      "WeIrD DoEs{{filesList}}NoT mEaN iNcOrReCt!",
      "{{ filesList }}",
    ])("ignore '{{filesList}}'", (templateString) => {
      const result = formatTemplate(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(expect.stringMatching(/\{\{\s*filesList\s*\}\}/));
    });

    test.each([
      "Optimized {{optimizedCount}} SVG(s)",
      "Optimize SVGs ({{ optimizedCount }})",
      "Hello, t{{optimizedCount}}his is weird...",
      "{{optimizedCount}}",
    ])("different templates using '{{optimizedCount}}'", (templateString) => {
      const result = formatTemplate(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(expect.stringMatching(/\{\{\s*optimizedCount\s*\}\}/));

      const expectedTitle = templateString.replace(/\{\{\s*optimizedCount\s*\}\}/, defaultData.optimizedCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each([0, 1, 3, 36])("different values for `optimizedCount`", (optimizedCount) => {
      const data = Object.assign({ }, defaultData, { optimizedCount });
      const templateString = "Optimized {{optimizedCount}} SVG(s)";

      const result = formatTemplate(templateString, defaultMessageTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`Optimized ${optimizedCount} SVG(s)`);
    });

  });

  describe("Message Templates", () => {

    test.todo("empty template string");

    test.each([
      "there is no templating value in here",
      "This isn't even my final form",
      "Rick Astley - Never gonne give you up",
    ])("no template values", (templateString) => {
      const result = formatTemplate(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(templateString);
    });

    test.each([
      "Optimized SVG(s):\n{{filesList}}",
      "This commit contains optimization for the following SVGs:\n{{ filesList }}",
      "WeIrD DoEs{{filesList}}NoT mEaN iNcOrReCt!",
      "{{ filesList }}",
    ])("different templates using '{{filesList}}'", (templateString) => {
      const result = formatTemplate(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(expect.stringMatching(/\{\{\s*filesList\s*\}\}/));
    });

    test.each([
      ["test.svg"],
      ["foo.svg", "bar.svg"],
      ["in/a/folder.svg", "and/this/one.svg"],
    ])("different values for  `filesList`", (...filePaths) => {
      const data = Object.assign({ }, defaultData, { filePaths });
      const templateString = "Optimized SVG(s):\n{{filesList}}";

      const result = formatTemplate(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      const expectedMessage = `Optimized SVG(s):\n${"- " + filePaths.join("\n- ")}`;
      expect(resultMessage).toEqual(expectedMessage);
    });

    test.each([
      "This commit contains {{optimizedCount}} optimized SVG(s)",
      "Optimize some SVGs ({{ optimizedCount }})",
      "Weird tem{{optimizedCount}}plates are templates too",
      "{{optimizedCount}}",
    ])("different templates using '{{optimizedCount}}'", (templateString) => {
      const result = formatTemplate(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(expect.stringMatching(/\{\{\s*optimizedCount\s*\}\}/));

      const expectedMessage = templateString.replace(/\{\{\s*optimizedCount\s*\}\}/, defaultData.optimizedCount.toString());
      expect(resultMessage).toEqual(expectedMessage);
    });

    test.each([0, 1, 3, 36])("different values for `optimizedCount`", (optimizedCount) => {
      const data = Object.assign({ }, defaultData, { optimizedCount });
      const templateString = "Optimized {{optimizedCount}} SVG(s)";

      const result = formatTemplate(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(`Optimized ${optimizedCount} SVG(s)`);
    });

  });

});
