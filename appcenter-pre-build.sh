#!/usr/bin/env bash
# Creates an .env from ENV variables for use with react-native-config

GOOGLE_JSON_FILE=$APPCENTER_SOURCE_DIRECTORY/android/app/google-services.json
GOOGLE_PLIST_FILE=$APPCENTER_SOURCE_DIRECTORY/ios/GoogleService-Info.plist


printf "%s\n\n" $APPCENTER_SOURCE_DIRECTORY

if [ -e "$GOOGLE_JSON_FILE" ]
then
    echo "Updating Google Json"
    echo "$GOOGLE_JSON" | base64 --decode > $GOOGLE_JSON_FILE
    sed -i -e 's/\\"/'\"'/g' $GOOGLE_JSON_FILE

    echo "File content:"
    cat $GOOGLE_JSON_FILE
else
    echo "Creating and Updating Google Json"
    touch $GOOGLE_JSON_FILE
    echo "$GOOGLE_JSON" | base64 --decode > $GOOGLE_JSON_FILE
    sed -i -e 's/\\"/'\"'/g' $GOOGLE_JSON_FILE

    echo "File content:"
    cat $GOOGLE_JSON_FILE
fi

printf "google-services json file:\n"

cat $GOOGLE_JSON_FILE

if [ -e "$GOOGLE_PLIST_FILE" ]
then
    echo "Updating Google Json"
    echo "$GOOGLE_PLIST" | base64 --decode > $GOOGLE_PLIST_FILE
    sed -i -e 's/\\"/'\"'/g' $GOOGLE_PLIST_FILE

    echo "File content:"
    cat $GOOGLE_PLIST_FILE
else
    echo "Creating and Updating Google Plist"
    touch $GOOGLE_PLIST_FILE
    echo "$GOOGLE_PLIST" | base64 --decode > $GOOGLE_PLIST_FILE
    sed -i -e 's/\\"/'\"'/g' $GOOGLE_PLIST_FILE

    echo "File content:"
    cat $GOOGLE_PLIST_FILE
fi

printf "google-services plist file:\n"

cat $GOOGLE_PLIST_FILE

printf "Old .env file:\n"
cat .env
printf "Started script:\n"
ENV_WHITELIST=${ENV_WHITELIST:-"/ACTIVITY|ANALYTICS|WEBSOCKET|BACKEND|API|TOKEN|PIN|USER|URL/"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | egrep -v "^_" | egrep -v "WHITELIST" | egrep -v "USER-DEFINED" > .env
printf "\n.env created with contents:\n"
cat .env
printf "\nEND OF .env\n"

cd ios && pod install && cd ..

cd android && ./gradlew clean && cd ..

