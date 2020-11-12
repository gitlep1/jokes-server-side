#!/bin/bash

API="https://jokes-server.herokuapp.com"
URL_PATH="/jokes"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
--header "Authorization: Bearer ${TOKEN}" \
--data '{
    "joke": {
      "joke": "'"${JOKE}"'",
      "punchLine": "'"${PL}"'"
    }
  }'

echo
