pipeline {

    agent any

    tools { 
        nodejs 'nodejs' 
    }
    environment {
        POSTGRES_ROOT_LOGIN = credentials('cre-postgres')
    }
    stages {

        stage('Build with Nodejs') {
            steps {
                // sh 'mvn --version'
                // sh 'java -version'
                // sh 'mvn clean package -Dmaven.test.failure.ignore=true'
                sh 'npm install'
                sh 'npm run build'
            }
        }

        stage('Packaging/Pushing image') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub', url: 'https://index.docker.io/v1/') {
                    sh 'docker build -t imghostcode/ctue-learn-english-api .'
                    sh 'docker push imghostcode/ctue-learn-english-api'
                }
            }
        }

        stage('Deploy Postgres to DEV') {
            steps {
                echo 'Deploying and cleaning'
                sh 'docker pull postgres'
                sh 'docker network create dev || echo "this network exists"'
                sh 'docker container stop ctue-postgres || echo "this container does not exist" '
                sh 'echo y | docker container prune '
                sh 'docker volume rm ctue-postgres-data || echo "no volume"'

                sh "docker run --name ctue-postgres --rm --network dev -v ctue-postgres-data:/var/lib/postgresql/data -e POSTGRES_USER=${POSTGRES_ROOT_LOGIN_USR} POSTGRES_PASSWORD=${POSTGRES_ROOT_LOGIN_PSW} -e POSTGRES_DB=ctue_db  -d postgres "
                sh 'sleep 20'
                sh "docker exec -i ctue-postgres psql -h ctue-postgres -U postgres --dbname=ctue_db --password=${POSTGRES_ROOT_LOGIN_PSW} < script"
            }
        }

        stage('Deploy NestJS to DEV') {
            steps {
                echo 'Deploying and cleaning'
                sh 'docker image pull imghostcode/ctue-learn-english-api'
                sh 'docker container stop ctue-nestjs-app || echo "this container does not exist" '
                sh 'docker network create dev || echo "this network exists"'
                sh 'echo y | docker container prune '

                sh 'docker container run -d --rm --name ctue-nestjs-app -p 8000:8000 --network dev imghostcode/ctue-learn-english-api'
            }
        }
 
    }
    post {
        // Clean after build
        always {
            cleanWs()
        }
    }
}