// https://nodejs.org/api/fs.html#fs_fs_existssync_path
const existsSync = jest.fn()
  .mockReturnValue(false)
  .mockName("fs.existsSync");

// https://nodejs.org/api/fs.html#fs_fs_lstatsync_path_options
const lstatSync = jest.fn()
  .mockReturnValue({
    isFile() { return true; },
  })
  .mockName("fs.lstatSync");

// https://nodejs.org/api/fs.html#fsopensyncpath-flags-mode
const openSync = jest.fn()
  .mockReturnValue(42)
  .mockName("fs.openSync");

// https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options
const readdirSync = jest.fn()
  .mockReturnValue([])
  .mockName("fs.readFileSync");

// https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
const readFileSync = jest.fn()
  .mockReturnValue(Uint8Array.from([]))
  .mockName("fs.readFileSync");

// https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options
const writeFileSync = jest.fn()
  .mockReturnValue(undefined)
  .mockName("fs.writeFileSync");

export {
  existsSync,
  lstatSync,
  openSync,
  readdirSync,
  readFileSync,
  writeFileSync,
};
