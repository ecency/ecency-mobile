#!/usr/bin/env bash
# Creates an .env from ENV variables for use with react-native-config
printf "Old .env file:\n"
cat .env
printf "Started script:\n"
ENV_WHITELIST=${ENV_WHITELIST:-"/ACTIVITY|WEBSOCKET|BACKEND|API|TOKEN|PIN|URL/"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | egrep -v "^_" | egrep -v "WHITELIST" | egrep -v "USER-DEFINED" > .env
printf "\n.env created with contents:\n"
cat .env
printf "\nEND OF .env\n"