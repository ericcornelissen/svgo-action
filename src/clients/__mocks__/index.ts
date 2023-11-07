// SPDX-License-Identifier: MIT

import Client from "./client";

const client = new Client();

const New = jest.fn()
  .mockReturnValue([client, null])
  .mockName("clients.New");

export default {
  New,
};
