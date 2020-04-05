import { CommitData, formatComment, formatCommitMessage } from "../src/templating";


const defaultData: CommitData = {
  fileCount: 1337,
  fileData: [
    {
      path: "test.svg",
      encoding: "utf-8",
      original: "Hello",
      optimized: "world",
    },
    {
      path: "foo.svg",
      encoding: "utf-8",
      original: "foo",
      optimized: "bar",
    },
    {
      path: "bar.svg",
      encoding: "utf-8",
      original: "bar",
      optimized: "foo",
    },
  ],
  optimizedCount: 3,
  skippedCount: 39,
  svgCount: 42,
};

describe("::formatComment", () => {

  const defaultCommentTemplate = "foobar";

  test("runs", () => {
    const result = formatComment(defaultCommentTemplate, defaultData);
    expect(result).toBeDefined();
  });

});

describe("::formatCommitMessage", () => {

  const defaultTitleTemplate = "foo";
  const defaultMessageTemplate = "bar";

  describe("Title templating", () => {

    test("empty template string", () => {
      const result = formatCommitMessage("", defaultMessageTemplate, defaultData);
      expect(result).toEqual(`\n\n${defaultMessageTemplate}`);
    });

    test.each([
      "there is no templating value in here",
      "This isn't even my final form",
      "Rick Astley - Never gonne give you up",
    ])("no template values (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(templateString);
    });

    test.each([
      "The PR contains {{fileCount}} file(s)",
      "There are {{ fileCount }} file(s) in this PR",
      "ninj{{fileCount }}a edit",
      "{{fileCount}}",
    ])("template using '{{fileCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*fileCount\s*\}\}/, defaultData.fileCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each([0, 1, 2, 80085])("different values for `fileCount` (%i)", (fileCount) => {
      const data = Object.assign({ }, defaultData, { fileCount });
      const templateString = "The PR contains {{fileCount}} file(s)";

      const result = formatCommitMessage(templateString, defaultMessageTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`The PR contains ${fileCount} file(s)`);
    });

    test.each([
      "Optimized SVG(s):\n{{filesList}}",
      "This commit contains optimization for the following SVGs:\n{{ filesList }}",
      "WeIrD DoEs{{filesList}}NoT mEaN iNcOrReCt!",
      "{{ filesList }}",
    ])("ignore '{{filesList}}' in '%s'", (templateString) => {
      const result = formatCommitMessage(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(templateString);
    });

    test.each([
      "Optimized {{optimizedCount}} SVG(s)",
      "Optimize SVGs ({{ optimizedCount }})",
      "Hello, t{{optimizedCount}}his is weird...",
      "{{optimizedCount}}",
    ])("template using '{{optimizedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*optimizedCount\s*\}\}/, defaultData.optimizedCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each([0, 1, 3, 36])("different values for `optimizedCount` (%i)", (optimizedCount) => {
      const data = Object.assign({ }, defaultData, { optimizedCount });
      const templateString = "Optimized {{optimizedCount}} SVG(s)";

      const result = formatCommitMessage(templateString, defaultMessageTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`Optimized ${optimizedCount} SVG(s)`);
    });

    test.each([
      "{{skippedCount}} SVG(s) were skipped",
      "Up to ({{ skippedCount }}) SVG(s) have been skipped",
      "No, this is Pa{{skippedCount}}trick",
      "{{skippedCount}}",
    ])("template using '{{skippedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*skippedCount\s*\}\}/, defaultData.skippedCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each([0, 1, 5, 42])("different values for `skippedCount` (%i)", (skippedCount) => {
      const data = Object.assign({ }, defaultData, { skippedCount });
      const templateString = "{{skippedCount}} SVG(s) were skipped";

      const result = formatCommitMessage(templateString, defaultMessageTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`${skippedCount} SVG(s) were skipped`);
    });

    test.each([
      "{{svgCount}} SVG(s) were considered",
      "There are ({{ svgCount }}) SVG(s) in this commit",
      "Hello, weird this i{{svgCount}}s...",
      "{{svgCount}}",
    ])("template using '{{svgCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultMessageTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*svgCount\s*\}\}/, defaultData.svgCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each([0, 1, 4, 9001])("different values for `svgCount` (%i)", (svgCount) => {
      const data = Object.assign({ }, defaultData, { svgCount });
      const templateString = "{{svgCount}} SVG(s) were considered";

      const result = formatCommitMessage(templateString, defaultMessageTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`${svgCount} SVG(s) were considered`);
    });

  });

  describe("Message templates", () => {

    test("empty template string", () => {
      const result = formatCommitMessage(defaultTitleTemplate, "", defaultData);
      expect(result).toEqual(defaultTitleTemplate);
    });

    test.each([
      "there is no templating value in here",
      "This isn't even my final form",
      "Rick Astley - Never gonne give you up",
    ])("no template values (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(templateString);
    });

    test.each([
      "For this commit {{fileCount}} file(s) were conidered",
      "Optimize some SVGs out of {{ fileCount }} file(s)",
      "Lo{{fileCount}}rem ipsum",
      "{{fileCount}}",
    ])("template using '{{fileCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(templateString);

      const expectedMessage = templateString.replace(/\{\{\s*fileCount\s*\}\}/, defaultData.fileCount.toString());
      expect(resultMessage).toEqual(expectedMessage);
    });

    test.each([0, 1, 2, 80085])("different values for `fileCount` (%i)", (fileCount) => {
      const data = Object.assign({ }, defaultData, { fileCount });
      const templateString = "The PR contains {{fileCount}} files";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(`The PR contains ${fileCount} files`);
    });

    test.each([
      "Optimized SVG(s):\n{{filesList}}",
      "This commit contains optimization for the following SVGs:\n{{ filesList }}",
      "WeIrD DoEs{{filesList}}NoT mEaN iNcOrReCt!",
      "{{ filesList }}",
    ])("template using '{{filesList}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(templateString);
    });

    test.each([
      ["test.svg"],
      ["foo.svg", "bar.svg"],
      ["in/a/folder.svg", "and/this/one.svg"],
    ])("different values for  `filesList`", (...filePaths) => {
      const data = Object.assign({ }, defaultData, {
        fileData: filePaths.map((path) => {
          return {
            path: path,
            encoding: "utf-8",
            original: "foo",
            optimized: "bar",
          };
        }),
      });
      const templateString = "Optimized SVG(s):\n{{filesList}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
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
    ])("template using '{{optimizedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(templateString);

      const expectedMessage = templateString.replace(/\{\{\s*optimizedCount\s*\}\}/, defaultData.optimizedCount.toString());
      expect(resultMessage).toEqual(expectedMessage);
    });

    test.each([0, 1, 3, 36])("different values for `optimizedCount` (%i)", (optimizedCount) => {
      const data = Object.assign({ }, defaultData, { optimizedCount });
      const templateString = "Optimized {{optimizedCount}} SVG(s)";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(`Optimized ${optimizedCount} SVG(s)`);
    });

    test.each([
      "{{skippedCount}} SVG(s) were skipped",
      "Up to ({{ skippedCount }}) SVG(s) have been skipped",
      "No, this is Pa{{skippedCount}}trick",
      "{{skippedCount}}",
    ])("template using '{{skippedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(templateString);

      const expectedMessage = templateString.replace(/\{\{\s*skippedCount\s*\}\}/, defaultData.skippedCount.toString());
      expect(resultMessage).toEqual(expectedMessage);
    });

    test.each([0, 1, 5, 42])("different values for `skippedCount` (%i)", (skippedCount) => {
      const data = Object.assign({ }, defaultData, { skippedCount });
      const templateString = "{{skippedCount}} SVG(s) were skipped";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(`${skippedCount} SVG(s) were skipped`);
    });

    test.each([
      "For this commit {{svgCount}} SVG(s) were conidered",
      "Optimize some SVGs, considered {{ svgCount }} SVG(s)",
      "foo b{{svgCount}}ar",
      "{{svgCount}}",
    ])("template using '{{svgCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).not.toEqual(templateString);

      const expectedMessage = templateString.replace(/\{\{\s*svgCount\s*\}\}/, defaultData.svgCount.toString());
      expect(resultMessage).toEqual(expectedMessage);
    });

    test.each([0, 1, 4, 9001])("different values for `svgCount` (%i)", (svgCount) => {
      const data = Object.assign({ }, defaultData, { svgCount });
      const templateString = "{{svgCount}} SVG(s) were considered";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultMessage = result.split("\n\n")[1];
      expect(resultMessage).toEqual(`${svgCount} SVG(s) were considered`);
    });

  });

});
