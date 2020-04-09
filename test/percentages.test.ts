import { toPercentage } from "../src/utils/percentages";


test.each([
  [0, 0],
  [1, 100],
  [0.5, 50],
  [0.3333, 33.33],
])("toPercentage the value %s", (decimal, expected) => {
  const actual = toPercentage(decimal);
  expect(actual).toEqual(expected);
});

