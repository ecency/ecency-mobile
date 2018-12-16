#!/usr/bin/env bash

printf "post-clone.sh\n"

brew uninstall node@6
brew unlink node

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash

nvm install 8.12.0