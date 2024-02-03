<!-- SPDX-License-Identifier: CC-BY-SA-4.0 -->

# SVGO Action Outputs

> [!WARNING]
> Support for SVGO Action, in general, will end 2024-04-30. We recommend finding
> an alternative before then and to stop using this Action.

This documentation describes all values outputted by the SVGO Action. These
values can be used in the steps that follow it to, for example, run a step only
if any SVGs were optimized or to build a message describing how many SVGs were
optimized.

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## Overview

This table lists and describes all output values of the SVGO Action.

| Output name       | Description                                   | Example |
| ----------------- | --------------------------------------------- | ------- |
| `DID_OPTIMIZE`    | Boolean indicating if any SVGs were optimized | `true`  |
| `OPTIMIZED_COUNT` | The number of SVGs that were optimized        | `1`     |
| `SVG_COUNT`       | The number of SVGs that were detected         | `4`     |

## Usage

To use an SVGO Action output value you must give the SVGO Action's step an `id`
and reference this `id` and the name of the output in the step(s) that uses it.
A step that uses an output value must come after the SVGO Action's step. For
example:

```yml
# .github/workflows/optimize.yml

steps:
  - uses: ericcornelissen/svgo-action@v4
    id: svgo  # <-- You need to give the SVGO Action's step a unique id
  - name: Echo the svgo-action output 'DID_OPTIMIZE'
    run: echo ${{ steps.svgo.outputs.DID_OPTIMIZE }}
    #                   ^^^^         ^^^^^^^^^^^^
    #                   |            |
    #                   |            | The name of the output you want to use
    #                   |
    #                   | The id of the SVGO Action's step
```

---

_Content licensed under [CC BY-SA 4.0]; Code snippets under the [MIT license]._

[cc by-sa 4.0]: https://creativecommons.org/licenses/by-sa/4.0/
[mit license]: https://opensource.org/license/mit/
[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
