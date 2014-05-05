#!/bin/bash

set -e

# This script is meant to be run automatically
# as part of the jekyll-hook application.
# https://github.com/developmentseed/jekyll-hook

repo=$1
branch=$2
owner=$3
giturl=$4
source=$5
giturlhttps=$6
build=$7
aa=$8

if [ -d "./scripts/temp" ]; then
 echo " Temp directory exists hence deleting it " 
 rm -rf ./scripts/temp/
fi

mkdir ./scripts/temp
cd ./scripts/temp/

git clone $giturlhttps
cd $1

jekyll build
cd -
