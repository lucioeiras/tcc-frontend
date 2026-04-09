pipeline {
    agent any

    environment {
        BUILD_PROJECT = "build_${BUILD_ID}"
        TEST_PROJECT  = "test_${BUILD_ID}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'DB_USER', variable: 'DB_USER'),
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'DB_NAME', variable: 'DB_NAME'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_EXPIRES_IN', variable: 'JWT_EXPIRES_IN')
                ]) {
                    sh '''
                        docker compose -p ${BUILD_PROJECT} down -v || true
                        docker compose -p ${BUILD_PROJECT} build --no-cache
                    '''
                }
            }
            post {
                always {
                    sh 'docker compose -p ${BUILD_PROJECT} down -v || true'
                }
            }
        }

        stage('Test') {
            steps {
                withCredentials([
                    string(credentialsId: 'DB_USER', variable: 'DB_USER'),
                    string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD'),
                    string(credentialsId: 'DB_NAME', variable: 'DB_NAME'),
                    string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET'),
                    string(credentialsId: 'JWT_EXPIRES_IN', variable: 'JWT_EXPIRES_IN')
                ]) {
                    sh '''
                        docker compose -p ${TEST_PROJECT} down -v || true
                        docker compose -p ${TEST_PROJECT} build --no-cache
                        docker compose -p ${TEST_PROJECT} up -d

                        timeout 60s bash -c 'until docker compose -p ${TEST_PROJECT} exec -T postgres pg_isready -U '"$DB_USER"'; do sleep 2; done'

                        docker compose -p ${TEST_PROJECT} exec -T app npx prisma generate
                        docker compose -p ${TEST_PROJECT} exec -T app npm test
                    '''
                }
            }
            post {
                always {
                    echo 'Publicando artifacts...'

                    archiveArtifacts artifacts: 'artifacts/**', fingerprint: true
                    junit 'artifacts/test-results.xml'

                    sh '''
                        docker compose -p ${TEST_PROJECT} logs --tail 100 || true
                        docker compose -p ${TEST_PROJECT} down -v || true
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Build e testes funcionais 🚀'
        }
        failure {
            echo 'Pipeline falhou ❌'
        }
    }
}