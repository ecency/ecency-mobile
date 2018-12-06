#!/usr/bin/env bash
# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST=${ENV_WHITELIST:-"/ACTIVITY|WEBSOCKET|BACKEND|API|TOKEN|URL/"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | egrep -v "^_" | egrep -v "WHITELIST" > .env
printf "\n.env created with contents:\n"
cat .env
printf "\nEND OF .env\n"