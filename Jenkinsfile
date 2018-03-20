pipeline {
  agent {
    node {
      label '10.0.190.250:5000/icapps/web'
    }
    
  }
  stages {
    stage('Install dependencies') {
      steps {
        sh 'yarn'
      }
    }
  }
}