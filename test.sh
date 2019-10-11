// scripts/Clear.sh
#!/bin/bash

echo "rm -rf ios/build..."
rm -rf ios/build

echo "rm -rf android/app/build..."
rm -rf android/app/build

echo "Removed all Xcode derived data..."
rm -rf ~/Library/Developer/Xcode/DerivedData

echo "rm -rf lib... (for Flow)"
rm -rf lib

echo "watchman watch-del-all..."
watchman watch-del-all

echo "rm -rf $TMPDIR/react-*..."
rm -rf $TMPDIR/react-*

echo "rm -rf $TMPDIR/haste-map-react-native-packager-*..."
rm -rf $TMPDIR/haste-map-react-native-packager-*