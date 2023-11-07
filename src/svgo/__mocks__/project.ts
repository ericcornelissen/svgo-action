// SPDX-License-Identifier: MIT

import { optimizer } from "./__common__";

const createSvgoOptimizerForProject = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.createSvgoOptimizerForProject");

export default createSvgoOptimizerForProject;
