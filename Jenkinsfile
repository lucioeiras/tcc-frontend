pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = "tcc-ci"
    }

    stages {

        stage('Checkout') {
            steps {
                git credentialsId: 'github-creds',
                    url: 'https://github.com/acJoaog/tcc-backend.git'
            }
        }

        stage('Build Containers') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
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
                curl -f http://localhost:3000 || exit 1
                '''
            }
        }

        stage('Run Tests (opcional)') {
            steps {
                sh '''
                docker exec tcc-backend-app npm test || echo "Sem testes ainda"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker-compose down'
        }

        success {
            echo 'CI/CD funcionando 🚀'
        }

        failure {
            echo 'Pipeline falhou ❌'
        }
    }
}