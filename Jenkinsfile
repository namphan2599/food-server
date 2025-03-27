pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-docker-registry'
        DOCKER_CREDENTIALS_ID = 'docker-credentials'
        KUBERNETES_CREDENTIALS_ID = 'kubernetes-credentials'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build and Test') {
            parallel {
                stage('User Service') {
                    steps {
                        dir('user-service') {
                            sh 'npm install'
                            sh 'npm run test'
                            sh 'npm run build'
                        }
                    }
                }
                
                stage('Restaurant Service') {
                    steps {
                        dir('restaurant-service') {
                            sh 'pip install -r requirements.txt'
                            sh 'pytest'
                        }
                    }
                }
                
                stage('Menu Service') {
                    steps {
                        dir('menu-service') {
                            sh 'pip install -r requirements.txt'
                            sh 'pytest'
                        }
                    }
                }
                
                stage('Order Service') {
                    steps {
                        dir('order-service') {
                            sh 'dotnet restore'
                            sh 'dotnet build'
                            sh 'dotnet test'
                        }
                    }
                }
                
                stage('Payment Service') {
                    steps {
                        dir('payment-service') {
                            sh 'npm install'
                            sh 'npm run test'
                            sh 'npm run build'
                        }
                    }
                }
                
                stage('Delivery Service') {
                    steps {
                        dir('delivery-service') {
                            sh 'npm install'
                            sh 'npm run test'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    def services = ['user-service', 'restaurant-service', 'menu-service', 'order-service', 'payment-service', 'delivery-service']
                    
                    for (service in services) {
                        sh "docker build -t ${DOCKER_REGISTRY}/${service}:${env.BUILD_NUMBER} -t ${DOCKER_REGISTRY}/${service}:latest ${service}"
                    }
                }
            }
        }
        
        stage('Push Docker Images') {
            steps {
                withCredentials([string(credentialsId: DOCKER_CREDENTIALS_ID, variable: 'DOCKER_AUTH')]) {
                    script {
                        sh 'echo $DOCKER_AUTH | docker login -u _json_key --password-stdin $DOCKER_REGISTRY'
                        
                        def services = ['user-service', 'restaurant-service', 'menu-service', 'order-service', 'payment-service', 'delivery-service']
                        
                        for (service in services) {
                            sh "docker push ${DOCKER_REGISTRY}/${service}:${env.BUILD_NUMBER}"
                            sh "docker push ${DOCKER_REGISTRY}/${service}:latest"
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: KUBERNETES_CREDENTIALS_ID, variable: 'KUBECONFIG')]) {
                    script {
                        sh 'kubectl apply -f kubernetes/'
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
    }
}