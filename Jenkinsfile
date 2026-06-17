pipeline {
    agent any

    triggers {
        githubPush() // Trigger build on GitHub push webhook
        pollSCM('H/15 * * * *') // Poll SCM every 15 minutes
    }

    environment {
        // Defining Java Home for the agent
        JAVA_HOME = '/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home'
        PATH = "${env.JAVA_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Install Frontend Dependencies') {
            steps {
                echo 'Installing frontend packages...'
                sh 'pnpm install'
            }
        }

        stage('Start Application Server') {
            steps {
                echo 'Starting Node.js application server in background...'
                // Run the app in background and redirect output
                sh 'nohup pnpm dev > server.log 2>&1 &'
                
                echo 'Waiting for server to become active on port 3000...'
                sh '''
                    timeout=30
                    count=0
                    until curl -s http://localhost:3000 > /dev/null || [ $count -eq $timeout ]; do
                        sleep 1
                        count=$((count + 1))
                    done
                    if [ $count -eq $timeout ]; then
                        echo "Timeout waiting for server to start!"
                        exit 1
                    fi
                    echo "Server is up and running!"
                '''
            }
        }

        stage('Run Selenium Tests (TestNG)') {
            steps {
                echo 'Running Selenium E2E tests with Maven and TestNG...'
                dir('tests/selenium') {
                    sh 'mvn clean test'
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up running application server...'
            // Stop the server running on port 3000
            sh 'kill $(lsof -t -i:3000) || true'
            
            echo 'Archiving TestNG test results...'
            // Publish TestNG results using the built-in JUnit step
            junit testResults: 'tests/selenium/target/surefire-reports/junitreports/*.xml'
        }
    }
}
