pipeline {
  agent {
    docker { image 'node:8' }
    }
  }
   environment {
    HEROKU_PROJECT  = 'icapps-nodejs-silverback-dev'
    DEPLOY_BRANCH   = 'origin/develop'
  }
  stages {
    stage('Install yarn') {
      steps {
        sh 'curl -o- -L https://yarnpkg.com/install.sh | bash'
      }
    }
    stage('Install dependencies') {
      steps {
        sh 'yarn'
      }
    }
    stage('Build the application') {
      steps {
        sh 'yarn build'
      }
    }
    stage('Deploy to Heroku') {
      steps {
        sh 'set -e'
        sh '''
            echo "Checking if remote exists..."
            if ! git ls-remote heroku; then
              echo "Adding heroku remote..."
              git remote add heroku git@heroku.com:${HEROKU_PROJECT}.git
            fi
        '''
        sh '''
            echo "Updating heroku master branch..."
            git push heroku ${DEPLOY_BRANCH}:master --force
        '''
      }
    }
  }
}
