import type { OptimizeFileData, OptimizeProjectData } from "../src/types";

import { formatComment } from "../src/templating";


const defaultData: OptimizeProjectData = {
  files: [
    {
      contentAfter: "world!",
      contentBefore: "Hello",
      path: "test.svg",
    },
    {
      contentAfter: "bar",
      contentBefore: "foo",
      path: "foo.svg",
    },
    {
      contentAfter: "foobaz",
      contentBefore: "foobarr",
      path: "bar.svg",
    },
  ],
  optimizedCount: 3,
  skippedCount: 3,
  svgCount: 42,
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

const values: {
  filesList: string[][],
  filesData: { [key: string]: OptimizeFileData[] }
  optimizedCount: number[],
  skippedCount: number[],
  svgCount: number[],
} = {
  filesList: [
    ["test.svg"],
    ["foo.svg", "bar.svg"],
    ["in/a/folder.svg", "and/this/one.svg"],
  ],
  filesData: {
    sample: [
      {
        contentAfter: "Hey",
        contentBefore: "Hello",
        path: "test.svg",
      },
    ],
  },
  optimizedCount: [0, 1, 3, 36],
  skippedCount: [0, 1, 5, 42],
  svgCount: [0, 1, 4, 9001],
};


describe("::formatComment", () => {

  const defaultCommentTemplate = "foobar";

  test("empty template string", () => {
    const result = formatComment(defaultCommentTemplate, defaultData, []);
    expect(result).toEqual(defaultCommentTemplate);
  });

  test.each(templates.noTemplateValues)("no template values (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData, []);
    expect(result).toEqual(templateString);
  });

  test.each(templates.filesList)("template using '{{filesList}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData, []);
    expect(result).not.toEqual(templateString);
  });

  test.each(values.filesList)("different values for  `filesList`", (...filePaths) => {
    const data = Object.assign({ }, defaultData, {
      files: filePaths.map((path) => {
        return {
          contentAfter: "Hello world!",
          contentBefore: "Hello world!",
          path: path,
        };
      }),
    });
    const templateString = "Optimized SVG(s):\n{{filesList}}";

    const result = formatComment(templateString, data, []);
    expect(result).toEqual(`Optimized SVG(s):\n${"- " + filePaths.join("\n- ")}`);
  });

  test("template using {{filesTable}}", () => {
    const templateString = "{{filesTable}}";

    const result = formatComment(templateString, defaultData, []);
    expect(result).toBeDefined();
    expect(result).toEqual(
      "| Filename | Before | After | Improvement |\n" +
      "| --- | --- | --- | --- |\n" +
      "| test.svg | 0.005 KB | 0.006 KB | 20% |\n" +
      "| foo.svg | 0.003 KB | 0.003 KB | -0% |\n" +
      "| bar.svg | 0.007 KB | 0.006 KB | -14.29% |\n",
    );
  });

  test.each(templates.optimizedCount)("template using '{{optimizedCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData, []);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*optimizedCount\s*\}\}/, defaultData.optimizedCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.optimizedCount)("different values for `optimizedCount` (%i)", (optimizedCount) => {
    const data = Object.assign({ }, defaultData, { optimizedCount });
    const templateString = "Optimized {{optimizedCount}} SVG(s)";

    const result = formatComment(templateString, data, []);
    expect(result).toEqual(`Optimized ${optimizedCount} SVG(s)`);
  });

  test.each(templates.skippedCount)("template using '{{skippedCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData, []);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*skippedCount\s*\}\}/, defaultData.skippedCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.skippedCount)("different values for `skippedCount` (%i)", (skippedCount) => {
    const data = Object.assign({ }, defaultData, { skippedCount });
    const templateString = "{{skippedCount}} SVG(s) were skipped";

    const result = formatComment(templateString, data, []);
    expect(result).toEqual(`${skippedCount} SVG(s) were skipped`);
  });

  test.each(templates.svgCount)("template using '{{svgCount}}' (%s)", (templateString) => {
    const result = formatComment(templateString, defaultData, []);
    expect(result).not.toEqual(templateString);

    const expected = templateString.replace(/\{\{\s*svgCount\s*\}\}/, defaultData.svgCount.toString());
    expect(result).toEqual(expected);
  });

  test.each(values.svgCount)("different values for `svgCount` (%i)", (svgCount) => {
    const data = Object.assign({ }, defaultData, { svgCount });
    const templateString = "{{svgCount}} SVG(s) were considered";

    const result = formatComment(templateString, data, []);
    expect(result).toEqual(`${svgCount} SVG(s) were considered`);
  });

  test("template using {{warnings}}, no warnings", () => {
    const templateString = "{{warnings}}";

    const result = formatComment(templateString, defaultData, []);
    expect(result).toBeDefined();
    expect(result).toEqual("");
  });

  test("template using {{warnings}}, one warnings", () => {
    const warning = "foo.svg could not be loaded, too big";
    const templateString = "{{warnings}}";

    const result = formatComment(templateString, defaultData, [warning]);
    expect(result).toBeDefined();
    expect(result).toEqual(expect.stringContaining(warning));
  });

  test("template using {{warnings}}, multiple warnings", () => {
    const warning1 = "foo.svg could not be loaded, too big";
    const warning2 = "bar.svg could not be loaded, too big";
    const templateString = "{{warnings}}";

    const result = formatComment(templateString, defaultData, [warning1, warning2]);
    expect(result).toBeDefined();
    expect(result).toEqual(expect.stringContaining(warning1));
    expect(result).toEqual(expect.stringContaining(warning2));
  });

});
