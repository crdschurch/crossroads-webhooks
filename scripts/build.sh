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
build=$6

# Git checkout appropriate branch, pull latest code
cd $source
git checkout $branch
git pull origin $branch

# Git submodules checkout appropriate branch, pulls all submodules
git submodule foreach --recursive git pull origin $branch
cd -

# Run jekyll
cd $source
jekyll build
cd -
