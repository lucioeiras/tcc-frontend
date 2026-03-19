pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Containers') {
            steps {
                sh '''
                docker compose -p build_${BUILD_ID} down -v || true
                docker compose -p build_${BUILD_ID} --env-file .env up -d --build
                '''
            }
        }

        stage('Wait for Services') {
            steps {
                sh '''
                echo "Aguardando serviços subirem..."
                sleep 15
                '''
            }
        }

        stage('Health Check API') {
            steps {
                sh '''
                docker compose -p build_${BUILD_ID} exec -T app curl -f http://localhost:3000 || exit 1
                '''
            }
        }

        stage('Run Tests (opcional)') {
            steps {
                sh '''
                docker compose -p build_${BUILD_ID} exec -T app npm test || echo "Sem testes ainda"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker compose -p build_${BUILD_ID} down -v'
        }

        success {
            echo 'CI/CD funcionando 🚀'
        }

        failure {
            echo 'Pipeline falhou ❌'
        }
    }
}