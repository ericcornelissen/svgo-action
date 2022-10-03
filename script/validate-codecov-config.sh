#!/bin/sh

RESULT=$( \
  curl --silent \
    --output /dev/null \
    --write-out "%{http_code}" \
    --data-binary @./.github/codecov.yml \
    https://codecov.io/validate \
)

if [ "$RESULT" != "200" ]; then
  echo "Codecov configuration is invalid"
  exit 1
else
  echo "Codecov configuration is valid"
fi
