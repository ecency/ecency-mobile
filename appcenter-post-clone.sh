#!/usr/bin/env bash

printf "post-clone.sh\n"

brew uninstall node@6

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

nvm use --delete-prefix v6.14.4 --silent

nvm install 8.12.0