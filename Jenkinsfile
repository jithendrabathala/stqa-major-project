pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'eu-north-1'
        AWS_ACCOUNT_ID     = '891982900466' // Replace with your actual AWS Account ID
        ECR_REPO_NAME      = 'book-management'
        ECS_CLUSTER_NAME   = 'stqa-major-project-cluster'
        ECS_SERVICE_NAME   = 'stqa-major-project-task-service'
    }

    triggers {
        githubPush() // Trigger build on GitHub push webhook
        pollSCM('H/5 * * * *') // Poll SCM every 5 minutes
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

        stage('Run Unit Tests') {
            steps {
                echo 'Running Unit Tests inside the application container...'
                sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml exec -T web pnpm run test:unit'
            }
        }

        stage('Run Cypress Tests') {
            steps {
                echo 'Running Cypress E2E tests inside container...'
                sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm cypress'
            }
        }

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
                    until curl -s http://localhost:3000/api/healthz > /dev/null || [ $count -eq $timeout ]; do
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

        // === CD Pipeline ===

        stage('Login to AWS ECR') {
            steps {
                echo 'Logging in to AWS ECR...'
                withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh 'aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com'
                }
            }
        }

        stage('Push Image to ECR') {
            steps {
                echo 'Pushing Docker image to Amazon ECR...'
                withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh '''
                        docker tag book-management:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest
                        docker tag book-management:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPO_NAME}:${BUILD_NUMBER}
                        docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPO_NAME}:latest
                        docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${ECR_REPO_NAME}:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                echo 'Updating ECS Service for continuous deployment...'
                withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                    sh 'aws ecs update-service --cluster ${ECS_CLUSTER_NAME} --service ${ECS_SERVICE_NAME} --force-new-deployment --region ${AWS_DEFAULT_REGION}'
                }
            }
        }
    }

    post {
        always {
            echo 'Shutting down Docker containers, cleaning volumes, and removing built images...'
            sh 'docker compose -f docker-compose.yml -f docker-compose.test.yml down -v --rmi local --remove-orphans'

            echo 'Archiving TestNG test results...'
            testNG reportFilenamePattern: 'tests/selenium/target/surefire-reports/testng-results.xml'
            junit testResults: 'tests/selenium/target/surefire-reports/junitreports/*.xml', allowEmptyResults: true
        }
    }
}
