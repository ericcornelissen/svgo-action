#!/bin/sh

__TRUE="x"
__FALSE=""

_get_stash_count () {
  local count=$(git rev-list --walk-reflogs --count refs/stash 2> /dev/null)
  if [ "$count" = "" ]; then
    echo "0"
  else
    echo $count
  fi
}

STASH_COUNT_BEFORE=$(_get_stash_count)
DID_STASH () {
  local STASH_COUNT_AFTER=$(_get_stash_count)
  if [ "$STASH_COUNT_BEFORE" != "$STASH_COUNT_AFTER" ]; then
    echo $__TRUE
  else
    echo $__FALSE
  fi
}

IS_MERGING () {
  if [ -f "$(git rev-parse --git-dir)/MERGE_HEAD" ]; then
    echo $__TRUE
  else
    echo $__FALSE
  fi
}
