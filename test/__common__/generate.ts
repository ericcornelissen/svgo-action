function createFilesList(length: number): unknown[] {
  const result: unknown[] = [];
  for (let _ = 0; _ < length; _++) {
    result.push({
      status: "added",
      filename: "foo.bar",
    });
  }

  return result;
}

export {
  createFilesList,
};
