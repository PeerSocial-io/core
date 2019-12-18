#!/bin/bash -e

##clear old build

rm -rf ./gun-bundle
rm -rf ./build/standalone


##bundle standalone 
scripts/makestandalone.sh


##copy custom plugins
cp -a plugins/c9.vfs.client build/standalone/modules/plugins/.

## bundle up
mkdir ./gun-bundle
mkdir ./gun-bundle/build
cp -a ./build/standalone ./gun-bundle/build/.
cp -a ./configs ./gun-bundle/.
cp -a ./lib gun-bundle/.
cp -a ./plugins ./gun-bundle/.
cp index.html ./gun-bundle/.
cp c9_index.js ./gun-bundle/.
cp static.js ./gun-bundle/.