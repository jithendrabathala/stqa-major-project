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
        PATH      = "${env.JAVA_HOME}/bin:${env.NODE_BIN}:${env.PNPM_BIN}:${env.PATH}"
    }

    stages {
        stage('Start Docker Containers') {
            steps {
                echo 'Building and starting app and database in Docker Compose...'
                sh 'docker compose up --build -d'
                
                echo 'Waiting for server to become active on port 3000...'
                sh '''
                    timeout=30
                    count=0
                    until curl -s http://localhost:3000 > /dev/null || [ $count -eq $timeout ]; do
                        sleep 1
                        count=$((count + 1))
                    done
                    if [ $count -eq $timeout ]; then
                        echo "Timeout waiting for server to start in Docker!"
                        exit 1
                    fi
                    echo "Dockerized application is up and running!"
                '''
            }
        }

        stage('Run Selenium Tests (TestNG)') {
            steps {
                echo 'Running Selenium E2E tests against Docker container...'
                dir('tests/selenium') {
                    sh 'mvn clean test'
                }
            }
        }
    }

    post {
        always {
            echo 'Shutting down Docker containers...'
            sh 'docker compose down'
            
            echo 'Archiving TestNG test results...'
            // Publish TestNG results using the built-in JUnit step, allowing empty if previous stages failed
            junit testResults: 'tests/selenium/target/surefire-reports/junitreports/*.xml', allowEmptyResults: true
        }
    }
}
