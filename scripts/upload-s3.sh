#!/bin/bash

set -e

# This script is meant to be run automatically
# as part of the jekyll-hook application.
# https://github.com/developmentseed/jekyll-hook

cd /var/www/milacron
git pull

files=$(shopt -s nullglob; echo app/img/*)

if (( ${#files} ))
then
  echo "contains some new files need to move to S3"
  aws s3 cp app/img/ s3://crossroads-media/images/ --recursive --acl public-read
  cd app/img/
  rm app/img/*.*
  git commit -m "Webhook removed images to S3" app/img/
  git push origin master
else
  echo "Files are empty so we dont need to do any thing"
fi

cd -
