#!/bin/sh

RESULT=$(curl -s -o /dev/null -w "%{http_code}" --data-binary @./.github/codecov.yml https://codecov.io/validate)
if [ "$RESULT" != "200" ]; then
  echo "Codecov configuration is invalid"
  exit 1
else
  echo "Codecov configuration is valid"
fi
