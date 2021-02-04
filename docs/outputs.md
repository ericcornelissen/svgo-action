# SVGO Action Outputs

This file contains the documentation about the output values of the SVGO Action.

The table below list every output available to you in the steps following the
SVGO Action.

| Output name       | Description                                                   |
| ----------------- | ------------------------------------------------------------- |
| `DID_OPTIMIZE`    | Set to `"true"` if any SVG was optimized, `"false"` otherwise |
| `OPTIMIZED_COUNT` | The number of SVGs that were optimized                        |
| `SKIPPED_COUNT`   | The number of SVGs that were detected but not optimized       |
| `SVG_COUNT`       | The number of SVGs that were detected                         |

To access these outputted values you must give the SVGO Action step an id and
reference it in the subsequent step that needs it:

```yml
# .github/workflows/svgo.yml
steps:
- uses: ericcornelissen/svgo-action@v1
  id: svgo  # <-- You need to give the SVGO Action step a unique id
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
- name: Consume output
  run: echo ${{ steps.svgo.outputs.DID_OPTIMIZE }}
                    # ^^^^ This should be the id given to the SVGO Action step
```
