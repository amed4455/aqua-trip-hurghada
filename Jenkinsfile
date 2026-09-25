pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh 'npm ci'
                        } else {
                            bat 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Syntax check') {
            steps {
                dir('backend') {
                    script {
                        if (isUnix()) {
                            sh 'npm run lint'
                        } else {
                            bat 'npm run lint'
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                expression {
                    def branch = (env.BRANCH_NAME ?: env.GIT_BRANCH ?: '').replaceFirst(/^origin\//, '')
                    return branch == 'master'
                }
            }
            steps {
                withCredentials([
                    string(credentialsId: 'vercel-deploy-hook-url', variable: 'VERCEL_DEPLOY_HOOK_URL')
                ]) {
                    script {
                        if (isUnix()) {
                            sh '''
                                echo "Triggering Vercel deploy..."
                                curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL"
                            '''
                        } else {
                            bat '''
                                echo Triggering Vercel deploy...
                                curl -fsS -X POST "%VERCEL_DEPLOY_HOOK_URL%"
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline succeeded.'
        }
        failure {
            echo 'Pipeline failed - deploy was not triggered.'
        }
    }
}
