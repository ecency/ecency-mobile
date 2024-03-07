#!/usr/bin/env bash

printf "post-clone.sh\n"

node -v

# please specify required Node.js version
#NODE_VERSION=8.16.0

# workaround to override the v8 alias
#npm config delete prefix
#. ~/.bashrc
#nvm install "$NODE_VERSION"
#nvm alias node8 "$NODE_VERSION"
#nvm alias default v8.16.0
#node -v

printf "end of post-clone.sh\n"

echo "Selected Platform to buit"
echo "$PLATFORM"

#check if platform to be built for is android
if [ "$PLATFORM" == "Android" ]; then

    echo "Android platform detected"
    # Read package.json into a variable
    package_json=$(<package.json)

    # Remove 'pod install' from the current postinstall script
    updated_package_json=$(echo "$package_json" | sed 's/ && cd ios && pod install//g')

    # Update package.json with the modified postinstall script
    echo "$updated_package_json" > package.json
    
elif [ "$PLATFORM" == "iOS" ]; then
    echo "Building for iOS"
fi