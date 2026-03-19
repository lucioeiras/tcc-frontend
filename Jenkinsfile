pipeline {
    agent any

    environment {
        COMPOSE_FILE = "docker-compose.ci.yml"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Environment') {
            steps {
                sh 'docker compose -f $COMPOSE_FILE down || true'
                sh 'docker compose -f $COMPOSE_FILE up -d --build'
            }
        }

        stage('Wait for DB') {
            steps {
                sh '''
                echo "Aguardando banco subir..."
                sleep 10
                '''
            }
        }

        stage('Run Migrations') {
            steps {
                sh '''
                docker compose -f $COMPOSE_FILE exec -T app npx prisma migrate deploy
                '''
            }
        }

        stage('Seed Database') {
            steps {
                sh '''
                docker compose -f $COMPOSE_FILE exec -T app npx prisma db seed || echo "Sem seed"
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                docker compose -f $COMPOSE_FILE exec -T app npm test
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                curl -f http://localhost:3001 || echo "Sem endpoint HTTP"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker compose -f $COMPOSE_FILE down -v'
        }

        success {
            echo 'Pipeline completo: build + migrate + test 🚀'
        }

        failure {
            echo 'Pipeline falhou ❌'
        }
    }
}