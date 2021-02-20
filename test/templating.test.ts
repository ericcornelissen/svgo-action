import { formatComment, formatCommitMessage } from "../src/templating";
import { CommitData } from "../src/types";


const defaultData: CommitData = {
  fileData: {
    optimized: [
      {
        content: "world!",
        originalEncoding: "utf-8",
        path: "test.svg",
      },
      {
        content: "bar",
        originalEncoding: "utf-8",
        path: "foo.svg",
      },
      {
        content: "foo",
        originalEncoding: "utf-8",
        path: "bar.svg",
      },
    ],
    original: [
      {
        content: "Hello",
        originalEncoding: "utf-8",
        path: "test.svg",
      },
      {
        content: "foo",
        originalEncoding: "utf-8",
        path: "foo.svg",
      },
      {
        content: "bar",
        originalEncoding: "utf-8",
        path: "bar.svg",
      },
    ],
  },
  ignoredCount: 36,
  optimizedCount: 3,
  skippedCount: 3,
  svgCount: 42,
  warnings: [],
};

const templates = {
  noTemplateValues: [
    "there is no templating value in here",
    "This isn't even my final form",
    "Rick Astley - Never gonne give you up",
  ],
  filesList: [
    "Optimized SVG(s):\n{{filesList}}",
    "This commit contains optimization for the following SVGs:\n{{ filesList }}",
    "WeIrD DoEs{{filesList}}NoT mEaN iNcOrReCt!",
    "{{ filesList }}",
  ],
  ignoredCount: [
    "This commit ignored {{ignoredCount}} SVG(s)",
    "Ignored some SVGs ({{ ignoredCount }})",
    "Why n{{ignoredCount}}ot Zoidberg?",
    "{{ignoredCount}}",
  ],
  optimizedCount: [
    "This commit contains {{optimizedCount}} optimized SVG(s)",
    "Optimize some SVGs ({{ optimizedCount }})",
    "Weird tem{{optimizedCount}}plates are templates too",
    "{{optimizedCount}}",
  ],
  skippedCount: [
    "{{skippedCount}} SVG(s) were skipped",
    "Up to ({{ skippedCount }}) SVG(s) have been skipped",
    "No, this is Pa{{skippedCount}}trick",
    "{{skippedCount}}",
  ],
  svgCount: [
    "For this commit {{svgCount}} SVG(s) were considered",
    "Optimize some SVGs, considered {{ svgCount }} SVG(s)",
    "foo b{{svgCount}}ar",
    "{{svgCount}}",
  ],
  warnings: [
    "Warnings are {{warnings}}",
    "Any warnings?: {{ warnings }}",
    "wa{{warnings }}rn",
    "{{warnings}}",
  ],
};

const values = {
  filesList: [
    ["test.svg"],
    ["foo.svg", "bar.svg"],
    ["in/a/folder.svg", "and/this/one.svg"],
  ],
  fileData: {
    optimizedFirst: {
      optimized: [
        {
          content: "Hey",
          originalEncoding: "utf-8",
          path: "test.svg",
        },
      ],
      original: [
        {
          content: "Hello",
          originalEncoding: "utf-8",
          path: "test.svg",
        },
        {
          content: "foo",
          originalEncoding: "utf-8",
          path: "foo.svg",
        },
      ],
    },
    optimizedSecond: {
      optimized: [
        {
          content: "foo",
          originalEncoding: "utf-8",
          path: "foo.svg",
        },
      ],
      original: [
        {
          content: "Hello",
          originalEncoding: "utf-8",
          path: "test.svg",
        },
        {
          content: "foobar",
          originalEncoding: "utf-8",
          path: "foo.svg",
        },
      ],
    },
    originalMissing: {
      optimized: [
        {
          content: "foo",
          originalEncoding: "utf-8",
          path: "foo.svg",
        },
      ],
      original: [ ],
    },
  },
  optimizedCount: [0, 1, 3, 36],
  ignoredCount: [0, 1, 6, 1337],
  skippedCount: [0, 1, 5, 42],
  svgCount: [0, 1, 4, 9001],
};


describe("::formatComment", () => {

  const defaultCommentTemplate = "foobar";

  test("empty template string", () => {
    const result = formatComment(defaultCommentTemplate, defaultData);
    expect(result).toEqual(defaultCommentTemplate);
  });

  test.each(templates.noTemplateValues)("no template values (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData);
    expect(result).toEqual(templateString);
  });

  test.each(templates.filesList)("template using '{{filesList}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData);
    expect(result).not.toEqual(templateString);
  });

  test.each(values.filesList)("different values for  `filesList`", (...filePaths) => {
    const data = Object.assign({ }, defaultData, {
      fileData: {
        optimized: filePaths.map((path) => {
          return {
            content: "Hey world!",
            originalEncoding: "base64",
            path: path,
          };
        }),
        original: filePaths.map((path) => {
          return {
            content: "Hello world!",
            originalEncoding: "base64",
            path: path,
          };
        }),
      },
    });
    const templateString = "Optimized SVG(s):\n{{filesList}}";

    const result = formatComment(templateString, data);
    expect(result).toEqual(`Optimized SVG(s):\n${"- " + filePaths.join("\n- ")}`);
  });

  test("template using {{filesTable}}, only first SVG is optimized", () => {
    const data = Object.assign({ }, defaultData, { fileData: values.fileData.optimizedFirst });
    const templateString = "{{filesTable}}";

    const result = formatComment(templateString, data);
    expect(result).toBeDefined();
    expect(result).toEqual(
      "| Filename | Before | After | Improvement |\n" +
      "| --- | --- | --- | --- |\n" +
      "| test.svg | 0.005 KB | 0.003 KB | -40% |\n",
    );
  });

  test("template using {{filesTable}}, only second SVG is optimized", () => {
    const data = Object.assign({ }, defaultData, { fileData: values.fileData.optimizedSecond });
    const templateString = "{{filesTable}}";

    const result = formatComment(templateString, data);
    expect(result).toBeDefined();
    expect(result).toEqual(
      "| Filename | Before | After | Improvement |\n" +
      "| --- | --- | --- | --- |\n" +
      "| foo.svg | 0.006 KB | 0.003 KB | -50% |\n",
    );
  });

  test("template using {{filesTable}}, missing original SVG data", () => {
    const data = Object.assign({ }, defaultData, { fileData: values.fileData.originalMissing });
    const templateString = "{{filesTable}}";

    expect(() => formatComment(templateString, data)).toThrow();
  });

  test.each(templates.ignoredCount)("template using '{{ignoredCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*ignoredCount\s*\}\}/, defaultData.ignoredCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.ignoredCount)("different values for `ignoredCount` (%i)", (ignoredCount) => {
    const data = Object.assign({ }, defaultData, { ignoredCount });
    const templateString = "The Action ignored {{ignoredCount}} files";

    const result = formatComment(templateString, data);
    expect(result).toEqual(`The Action ignored ${ignoredCount} files`);
  });

  test.each(templates.optimizedCount)("template using '{{optimizedCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*optimizedCount\s*\}\}/, defaultData.optimizedCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.optimizedCount)("different values for `optimizedCount` (%i)", (optimizedCount) => {
    const data = Object.assign({ }, defaultData, { optimizedCount });
    const templateString = "Optimized {{optimizedCount}} SVG(s)";

    const result = formatComment(templateString, data);
    expect(result).toEqual(`Optimized ${optimizedCount} SVG(s)`);
  });

  test.each(templates.skippedCount)("template using '{{skippedCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*skippedCount\s*\}\}/, defaultData.skippedCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.skippedCount)("different values for `skippedCount` (%i)", (skippedCount) => {
    const data = Object.assign({ }, defaultData, { skippedCount });
    const templateString = "{{skippedCount}} SVG(s) were skipped";

    const result = formatComment(templateString, data);
    expect(result).toEqual(`${skippedCount} SVG(s) were skipped`);
  });

  test.each(templates.svgCount)("template using '{{svgCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*svgCount\s*\}\}/, defaultData.svgCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.svgCount)("different values for `svgCount` (%i)", (svgCount) => {
    const data = Object.assign({ }, defaultData, { svgCount });
    const templateString = "{{svgCount}} SVG(s) were considered";

    const result = formatComment(templateString, data);
    expect(result).toEqual(`${svgCount} SVG(s) were considered`);
  });

  test("template using {{warnings}}, no warnings", () => {
    const data = Object.assign({}, defaultData, { warnings: [] });
    const templateString = "{{warnings}}";

    const result = formatComment(templateString, data);
    expect(result).toBeDefined();
    expect(result).toEqual("");
  });

  test("template using {{warnings}}, one warnings", () => {
    const warning = "foo.svg could not be loaded, too big";
    const data = Object.assign({}, defaultData, { warnings: [warning] });
    const templateString = "{{warnings}}";

    const result = formatComment(templateString, data);
    expect(result).toBeDefined();
    expect(result).toEqual(expect.stringContaining(warning));
  });

  test("template using {{warnings}}, multiple warnings", () => {
    const warning1 = "foo.svg could not be loaded, too big";
    const warning2 = "bar.svg could not be loaded, too big";
    const data = Object.assign({}, defaultData, { warnings: [warning1, warning2] });
    const templateString = "{{warnings}}";

    const result = formatComment(templateString, data);
    expect(result).toBeDefined();
    expect(result).toEqual(expect.stringContaining(warning1));
    expect(result).toEqual(expect.stringContaining(warning2));
  });

});

describe("::formatCommitMessage", () => {

  const defaultTitleTemplate = "foo";
  const defaultBodyTemplate = "bar";

  describe("Title templating", () => {

    test("empty template string", () => {
      const result = formatCommitMessage("", defaultBodyTemplate, defaultData);
      expect(result).toEqual(`\n\n${defaultBodyTemplate}`);
    });

    test.each(templates.noTemplateValues)("no template values (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(templateString);
    });

    test.each(templates.filesList)("ignore '{{filesList}}' in '%s'", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(templateString);
    });

    test.each(templates.ignoredCount)("template using '{{ignoredCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).not.toEqual(templateString);

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*ignoredCount\s*\}\}/, defaultData.ignoredCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each(values.ignoredCount)("different values for `ignoredCount` (%i)", (ignoredCount) => {
      const data = Object.assign({ }, defaultData, { ignoredCount });
      const templateString = "The Action ignored {{ignoredCount}} files";

      const result = formatCommitMessage(templateString, defaultBodyTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`The Action ignored ${ignoredCount} files`);
    });

    test.each(templates.optimizedCount)("template using '{{optimizedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(
        /\{\{\s*optimizedCount\s*\}\}/,
        defaultData.optimizedCount.toString(),
      );
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each(values.optimizedCount)("different values for `optimizedCount` (%i)", (optimizedCount) => {
      const data = Object.assign({ }, defaultData, { optimizedCount });
      const templateString = "Optimized {{optimizedCount}} SVG(s)";

      const result = formatCommitMessage(templateString, defaultBodyTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`Optimized ${optimizedCount} SVG(s)`);
    });

    test.each(templates.skippedCount)("template using '{{skippedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*skippedCount\s*\}\}/, defaultData.skippedCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each(values.skippedCount)("different values for `skippedCount` (%i)", (skippedCount) => {
      const data = Object.assign({ }, defaultData, { skippedCount });
      const templateString = "{{skippedCount}} SVG(s) were skipped";

      const result = formatCommitMessage(templateString, defaultBodyTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`${skippedCount} SVG(s) were skipped`);
    });

    test.each(templates.svgCount)("template using '{{svgCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).not.toEqual(templateString);

      const expectedTitle = templateString.replace(/\{\{\s*svgCount\s*\}\}/, defaultData.svgCount.toString());
      expect(resultTitle).toEqual(expectedTitle);
    });

    test.each(values.svgCount)("different values for `svgCount` (%i)", (svgCount) => {
      const data = Object.assign({ }, defaultData, { svgCount });
      const templateString = "{{svgCount}} SVG(s) were considered";

      const result = formatCommitMessage(templateString, defaultBodyTemplate, data);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(`${svgCount} SVG(s) were considered`);
    });

    test.each(templates.warnings)("ignore '{{warnings}}' in '%s'", (templateString) => {
      const result = formatCommitMessage(templateString, defaultBodyTemplate, defaultData);
      expect(result).toBeDefined();

      const resultTitle = result.split("\n\n")[0];
      expect(resultTitle).toEqual(templateString);
    });

  });

  describe("Body templates", () => {

    test("empty template string", () => {
      const result = formatCommitMessage(defaultTitleTemplate, "", defaultData);
      expect(result).toEqual(defaultTitleTemplate);
    });

    test.each(templates.noTemplateValues)("no template values (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(templateString);
    });

    test.each(templates.filesList)("template using '{{filesList}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).not.toEqual(templateString);
    });

    test.each(values.filesList)("different values for  `filesList`", (...filePaths) => {
      const data = Object.assign({ }, defaultData, {
        fileData: {
          optimized: filePaths.map((path) => {
            return {
              content: "Hey world!",
              originalEncoding: "base64",
              path: path,
            };
          }),
          original: filePaths.map((path) => {
            return {
              content: "Hello world!",
              originalEncoding: "base64",
              path: path,
            };
          }),
        },
      });
      const templateString = "Optimized SVG(s):\n{{filesList}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      const expectedBody = `Optimized SVG(s):\n${"- " + filePaths.join("\n- ")}`;
      expect(resultBody).toEqual(expectedBody);
    });

    test("template using {{filesTable}}, only first SVG is optimized", () => {
      const data = Object.assign({ }, defaultData, { fileData: values.fileData.optimizedFirst });
      const templateString = "{{filesTable}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();


      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(
        "| Filename | Before | After | Improvement |\n" +
        "| --- | --- | --- | --- |\n" +
        "| test.svg | 0.005 KB | 0.003 KB | -40% |",
      );
    });

    test("template using {{filesTable}}, only second SVG is optimized", () => {
      const data = Object.assign({ }, defaultData, { fileData: values.fileData.optimizedSecond });
      const templateString = "{{filesTable}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();


      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(
        "| Filename | Before | After | Improvement |\n" +
        "| --- | --- | --- | --- |\n" +
        "| foo.svg | 0.006 KB | 0.003 KB | -50% |",
      );
    });

    test.each(templates.ignoredCount)("template using '{{ignoredCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).not.toEqual(templateString);

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).not.toEqual(templateString);

      const expectedBody = templateString.replace(/\{\{\s*ignoredCount\s*\}\}/, defaultData.ignoredCount.toString());
      expect(resultBody).toEqual(expectedBody);
    });

    test.each(values.ignoredCount)("different values for `ignoredCount` (%i)", (ignoredCount) => {
      const data = Object.assign({ }, defaultData, { ignoredCount });
      const templateString = "The Action ignored {{ignoredCount}} files";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(`The Action ignored ${ignoredCount} files`);
    });

    test.each(templates.optimizedCount)("template using '{{optimizedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).not.toEqual(templateString);

      const expectedBody = templateString.replace(
        /\{\{\s*optimizedCount\s*\}\}/,
        defaultData.optimizedCount.toString(),
      );
      expect(resultBody).toEqual(expectedBody);
    });

    test.each(values.optimizedCount)("different values for `optimizedCount` (%i)", (optimizedCount) => {
      const data = Object.assign({ }, defaultData, { optimizedCount });
      const templateString = "Optimized {{optimizedCount}} SVG(s)";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(`Optimized ${optimizedCount} SVG(s)`);
    });

    test.each(templates.skippedCount)("template using '{{skippedCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).not.toEqual(templateString);

      const expectedBody = templateString.replace(/\{\{\s*skippedCount\s*\}\}/, defaultData.skippedCount.toString());
      expect(resultBody).toEqual(expectedBody);
    });

    test.each(values.skippedCount)("different values for `skippedCount` (%i)", (skippedCount) => {
      const data = Object.assign({ }, defaultData, { skippedCount });
      const templateString = "{{skippedCount}} SVG(s) were skipped";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(`${skippedCount} SVG(s) were skipped`);
    });

    test.each(templates.svgCount)("template using '{{svgCount}}' (%s)", (templateString) => {
      const result = formatCommitMessage(defaultTitleTemplate, templateString, defaultData);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).not.toEqual(templateString);

      const expectedBody = templateString.replace(/\{\{\s*svgCount\s*\}\}/, defaultData.svgCount.toString());
      expect(resultBody).toEqual(expectedBody);
    });

    test.each(values.svgCount)("different values for `svgCount` (%i)", (svgCount) => {
      const data = Object.assign({ }, defaultData, { svgCount });
      const templateString = "{{svgCount}} SVG(s) were considered";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(`${svgCount} SVG(s) were considered`);
    });

    test("template using {{warnings}}, no warnings", () => {
      const data = Object.assign({}, defaultData, { warnings: [] });
      const templateString = "Any warnings?:\n{{warnings}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual("Any warnings?:");
    });

    test("template using {{warnings}}, one warnings", () => {
      const warning = "foo.svg could not be loaded, too big";
      const data = Object.assign({}, defaultData, { warnings: [warning] });
      const templateString = "{{warnings}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(expect.stringContaining(warning));
    });

    test("template using {{warnings}}, multiple warnings", () => {
      const warning1 = "foo.svg could not be loaded, too big";
      const warning2 = "bar.svg could not be loaded, too big";
      const data = Object.assign({}, defaultData, { warnings: [warning1, warning2] });
      const templateString = "{{warnings}}";

      const result = formatCommitMessage(defaultTitleTemplate, templateString, data);
      expect(result).toBeDefined();

      const resultBody = result.split("\n\n")[1];
      expect(resultBody).toEqual(expect.stringContaining(warning1));
      expect(resultBody).toEqual(expect.stringContaining(warning2));
    });

  });

});
