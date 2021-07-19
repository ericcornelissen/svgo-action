# SVGO Action Outputs

The table below list every output available to you in the steps following the
SVGO Action.

| Output name       | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `DID_OPTIMIZE`    | `"true"` if any SVG was optimized, `"false"` otherwise |
| `IGNORED_COUNT`   | The number of SVGs that were ignored due to the config |
| `OPTIMIZED_COUNT` | The number of SVGs that were optimized                 |
| `SVG_COUNT`       | The number of SVGs that were detected                  |

To access these outputted values you must give the SVGO Action step an id and
reference it in the subsequent step that needs it:

```yml
# .github/workflows/svgo.yml
steps:
- uses: ericcornelissen/svgo-action@next
  id: svgo  # <-- You need to give the SVGO Action step a unique id
  with:
    repo-token: ${{ secrets.GITHUB_TOKEN }}
- name: Consume output
  run: echo ${{ steps.svgo.outputs.DID_OPTIMIZE }}
  #                   ^            ^
  #                   |            | The name of the output you need
  #                   |
  #                   | The id of the SVGO Action step
```
