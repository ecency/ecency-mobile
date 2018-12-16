#!/usr/bin/env bash

printf "post-clone.sh\n"

brew uninstall node@6
brew unlink node

brew install node@8