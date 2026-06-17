pipeline {
    agent any

    triggers {
        githubPush() // Trigger build on GitHub push webhook
        pollSCM('H/15 * * * *') // Poll SCM every 15 minutes
    }

    environment {
        // Defining Java Home, Node, and PNPM binary paths for the agent
        JAVA_HOME = '/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home'
        NODE_BIN  = '/Users/jithendra/.nvm/versions/node/v22.21.0/bin'
        PNPM_BIN  = '/Users/jithendra/Library/pnpm'
        // Prepend /opt/homebrew/bin for colima/docker/docker-compose
        PATH      = "/opt/homebrew/bin:${env.JAVA_HOME}/bin:${env.NODE_BIN}:${env.PNPM_BIN}:${env.PATH}"
        // Base URL for E2E tests
        APP_BASE_URL = 'http://localhost:3000'
    }

    stages {
        // === CI Pipeline ===

        stage('Checkout Source') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Building application Docker image using Docker Compose...'
                sh 'docker compose build'
            }
        }

        stage('Start Container') {
            steps {
                echo 'Starting application and database containers...'
                sh 'docker compose up -d'
            }
        }

        stage('Run Unit Tests') {
            steps {
                echo 'Running Unit Tests inside the application container...'
                sh 'docker compose exec -T app pnpm run test:unit'
            }
        }

        stage('Run Cypress Tests') {
            steps {
                echo 'Installing local frontend dependencies for Cypress runner...'
                sh 'pnpm install'
                echo 'Running Cypress End-to-End tests...'
                sh 'pnpm run cypress:run'
            }
        }

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium E2E tests with Maven and TestNG...'
                dir('tests/selenium') {
                    sh 'mvn clean test'
                }
            }
        }

        stage('Perform Health Check') {
            steps {
                echo 'Performing health check on the running application...'
                sh '''
                    timeout=30
                    count=0
                    until curl -s http://localhost:3000/api/books > /dev/null || [ $count -eq $timeout ]; do
                        sleep 1
                        count=$((count + 1))
                    done
                    if [ $count -eq $timeout ]; then
                        echo "Health check failed: Server is not responding!"
                        exit 1
                    fi
                    echo "Health check passed: Server is running successfully on port 3000!"
                '''
            }
        }

    }

    post {
        always {
            echo 'Shutting down Docker containers and cleaning volumes...'
            sh 'docker compose down -v'

            echo 'Archiving TestNG test results...'
            junit testResults: 'tests/selenium/target/surefire-reports/junitreports/*.xml', allowEmptyResults: true
        }
    }
}
