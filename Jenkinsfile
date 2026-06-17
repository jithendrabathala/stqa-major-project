pipeline {
    agent any

    triggers {
        githubPush() // Trigger build on GitHub push webhook
        pollSCM('H/15 * * * *') // Poll SCM every 15 minutes
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
                // Build only the production app container
                sh 'docker compose build'
            }
        }

        stage('Start Container') {
            steps {
                echo 'Starting application, database, and browser containers...'
                sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml up -d web mongodb chrome'
            }
        }

        // stage('Run Unit Tests') {
        //     steps {
        //         echo 'Running Unit Tests inside the application container...'
        //         sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml exec -T web pnpm run test:unit'
        //     }
        // }

        // stage('Run Cypress Tests') {
        //     steps {
        //         echo 'Running Cypress E2E tests inside container...'
        //         sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm cypress'
        //     }
        // }

        stage('Run Selenium Tests') {
            steps {
                echo 'Running Selenium E2E tests inside Maven container...'
                sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm selenium-runner'
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
            echo 'Shutting down Docker containers, cleaning volumes, and removing built images...'
            sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml down -v --rmi local --remove-orphans'

            echo 'Archiving TestNG test results...'
            junit testResults: 'tests/selenium/target/surefire-reports/junitreports/*.xml', allowEmptyResults: true
        }
    }
}
