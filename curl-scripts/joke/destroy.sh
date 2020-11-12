#!/bin/bash

API="https://jokes-server.herokuapp.com"
URL_PATH="/jokes"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request DELETE \
  --header "Authorization: Bearer ${TOKEN}"

echo
