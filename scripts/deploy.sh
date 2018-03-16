#!/bin/bash

function run {
  echo $1
  $1
}

function deployHeroku {
  # Setup it the git remote exists. If not create the remote for the
  # correct environment.
  echo "Checking if remote exists..."
  if ! git ls-remote heroku; then
    echo "Adding heroku..."
    run "git remote add heroku git@heroku.com:$heroku_project.git"
  fi

  # Keep track of the previous Heroku build number.
  previous_heroku_build_version=`heroku releases | sed -n 2p | awk '{print $1}'`

  # Build the image using docker and push it to heroku
  echo "Deploying worker with docker"
  run "heroku container:login"
  heroku container:push --recursive -a $heroku_project -r $deploy_branch

  echo "Run pending migrations"
  run "heroku run yarn db:migrate --app $heroku_project"

  # Fetch the new build version number.
  heroku_build_version=`heroku releases | sed -n 2p | awk '{print $1}'`

  # Only tag the current commit when the build version is different from the previous one.
  if [[ "$previous_heroku_build_version" != $heroku_build_version  ]]
  then
    # Tag the current commit with the Heroku deploy version.
    echo "Tagging the current commit..."
    run "git tag -a $deploy_environment/$heroku_build_version -m Build"
    run "git push -f origin $deploy_environment/$heroku_build_version"
  fi
}

# exit 1 on errors
set -e

# Set the following variables for deployment:
#  - heroku project
#  - deployment branch
deploy_environment=$1
tag="${deploy_environment}-${BUILD_NUMBER}"

if [[ "$deploy_environment" == "develop"  ]]
then
  echo "Deploying to develop"
  deploy_branch='origin/develop'
  heroku_project='icapps-nodejs-silverback-dev'
  deployHeroku

elif [[ "$deploy_environment" == "staging"  ]]
then
  echo "Deploying to staging"
  deploy_branch='origin/staging'
  heroku_project='icapps-nodejs-silverback-stag'
  deployHeroku

elif [[ "$deploy_environment" == "production"  ]]
then
  echo "Deploying to production"
  deploy_branch='origin/master'
  heroku_project='icapps-nodejs-silverback'
  deployHeroku

else
  exit "You passed the incorrect environment argument. One of theses (staging) should be given."
fi
