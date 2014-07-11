#!/bin/bash

set -e

repo=$1
branch=$2
owner=$3
giturl=$4
source=$5
giturlhttps=$6
build=$7
aa=$8

cd $5
git pull

files=$(shopt -s nullglob; echo app/img/*)

if (( ${#files} ))
then
  echo "contains some new files need to move to S3"
  aws s3 cp app/img/*.* s3://crossroads-media/images/  --acl public-read
  rm app/img/*.*
  git commit -m "Milacron webhook moved images to S3" app/img/
  git push origin master
else
  echo "Files are empty so we dont need to do any thing"
fi

cd -
