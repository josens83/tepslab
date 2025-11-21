# TEPS Lab 프로덕션 배포 가이드

## 목차
1. [사전 요구사항](#사전-요구사항)
2. [Kubernetes 배포](#kubernetes-배포)
3. [Helm Charts 배포](#helm-charts-배포)
4. [환경 설정](#환경-설정)
5. [SSL/TLS 인증서](#ssltls-인증서)
6. [백업 및 복구](#백업-및-복구)
7. [모니터링](#모니터링)
8. [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

### 필수 도구
- **kubectl** (v1.27+)
- **Helm** (v3.12+)
- **Docker** (v24+)
- **AWS CLI** (선택사항, S3 백업용)

### Kubernetes 클러스터
- **노드**: 최소 3개 (Worker Nodes)
- **CPU**: 최소 8 cores
- **메모리**: 최소 16GB RAM
- **스토리지**: 최소 100GB

### 필수 Kubernetes 애드온
```bash
# NGINX Ingress Controller 설치
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# cert-manager 설치 (SSL 인증서 자동 발급)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Metrics Server 설치 (HPA용)
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

## Kubernetes 배포

### 1. Namespace 생성
```bash
kubectl apply -f k8s/namespace.yaml
```

### 2. Secrets 설정
```bash
# secrets.yaml 파일을 실제 값으로 업데이트
vi k8s/secrets.yaml

# Secrets 적용
kubectl apply -f k8s/secrets.yaml
```

### 3. 리소스 배포
```bash
# 순서대로 배포
kubectl apply -f k8s/persistent-volumes.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/cert-manager-issuer.yaml
kubectl apply -f k8s/ingress.yaml
```

### 4. 배포 스크립트 사용 (권장)
```bash
cd scripts
chmod +x deploy.sh

# Production 배포
./deploy.sh --method kubectl --env production

# Staging 배포
./deploy.sh --method kubectl --env staging
```

---

## Helm Charts 배포

### 1. Helm Values 설정
```bash
# Production values 편집
vi helm/tepslab/values.yaml

# 주요 설정 항목:
# - global.domain: tepslab.com
# - secrets.*: 모든 시크릿 값
# - mongodb.auth.*: MongoDB 인증 정보
```

### 2. Helm 설치
```bash
# Production 배포
helm install tepslab ./helm/tepslab \
  --namespace tepslab \
  --create-namespace \
  --values helm/tepslab/values.yaml

# Staging 배포
helm install tepslab-staging ./helm/tepslab \
  --namespace tepslab-staging \
  --create-namespace \
  --values helm/tepslab/values-staging.yaml
```

### 3. Helm 업그레이드
```bash
helm upgrade tepslab ./helm/tepslab \
  --namespace tepslab \
  --values helm/tepslab/values.yaml
```

### 4. Helm 배포 스크립트 사용 (권장)
```bash
cd scripts
./deploy.sh --method helm --env production
```

---

## 환경 설정

### Server 환경 변수
```bash
# Production
cp server/.env.production server/.env

# Staging
cp server/.env.staging server/.env
```

**주요 환경 변수:**
- `NODE_ENV`: production / staging / development
- `MONGODB_URI`: MongoDB 연결 문자열
- `REDIS_URL`: Redis 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키 (강력한 랜덤 문자열)
- `TOSS_SECRET_KEY`: TossPayments API 키
- `SENTRY_DSN`: Sentry 모니터링 DSN

### Client 환경 변수
```bash
# Production
cp client/.env.production client/.env

# Staging
cp client/.env.staging client/.env
```

**주요 환경 변수:**
- `VITE_API_URL`: API 서버 URL
- `VITE_TOSS_CLIENT_KEY`: TossPayments 클라이언트 키
- `VITE_SENTRY_DSN`: Sentry DSN
- `VITE_GA_MEASUREMENT_ID`: Google Analytics ID

---

## SSL/TLS 인증서

### Let's Encrypt 자동 발급
cert-manager가 자동으로 Let's Encrypt 인증서를 발급합니다.

```bash
# ClusterIssuer 생성
kubectl apply -f k8s/cert-manager-issuer.yaml

# 인증서 상태 확인
kubectl get certificate -n tepslab
kubectl describe certificate tepslab-tls -n tepslab
```

### 인증서 갱신
Let's Encrypt 인증서는 90일마다 자동으로 갱신됩니다.

```bash
# 수동 갱신 트리거
kubectl delete certificate tepslab-tls -n tepslab
kubectl apply -f k8s/ingress.yaml
```

---

## 백업 및 복구

### 수동 백업
```bash
cd scripts
chmod +x backup.sh

# 로컬 백업
./backup.sh

# S3로 백업
S3_BUCKET=my-tepslab-backups ./backup.sh
```

### 자동 백업 (CronJob)
```bash
# Backup CronJob 배포 (매일 오전 2시)
kubectl apply -f k8s/backup-cronjob.yaml

# CronJob 상태 확인
kubectl get cronjobs -n tepslab
kubectl get jobs -n tepslab
```

### 복구
```bash
cd scripts
chmod +x restore.sh

# 로컬 백업에서 복구
./restore.sh tepslab-backup-20250121_120000.tar.gz

# S3에서 복구
S3_BUCKET=my-tepslab-backups \
./restore.sh s3://my-tepslab-backups/backups/tepslab-backup-20250121_120000.tar.gz
```

---

## 모니터링

### 배포 상태 확인
```bash
# 전체 리소스 확인
kubectl get all -n tepslab

# Pod 상태 확인
kubectl get pods -n tepslab

# 로그 확인
kubectl logs -n tepslab -l app=server --tail=100 -f
kubectl logs -n tepslab -l app=client --tail=100 -f
```

### HPA 모니터링
```bash
# HPA 상태 확인
kubectl get hpa -n tepslab

# 자세한 정보
kubectl describe hpa tepslab-server-hpa -n tepslab
```

### Ingress 확인
```bash
# Ingress 상태
kubectl get ingress -n tepslab

# Ingress 상세 정보
kubectl describe ingress tepslab-ingress -n tepslab
```

---

## 트러블슈팅

### Pod가 시작되지 않음
```bash
# Pod 상태 확인
kubectl describe pod <pod-name> -n tepslab

# 로그 확인
kubectl logs <pod-name> -n tepslab --previous
```

### 인증서 발급 실패
```bash
# Certificate 상태 확인
kubectl describe certificate tepslab-tls -n tepslab

# cert-manager 로그 확인
kubectl logs -n cert-manager -l app=cert-manager
```

### 데이터베이스 연결 실패
```bash
# MongoDB Pod 확인
kubectl exec -it -n tepslab <mongodb-pod> -- mongosh

# Redis Pod 확인
kubectl exec -it -n tepslab <redis-pod> -- redis-cli ping
```

### HPA 작동 안함
```bash
# Metrics Server 확인
kubectl top nodes
kubectl top pods -n tepslab

# Metrics Server 재시작
kubectl rollout restart deployment metrics-server -n kube-system
```

---

## 유용한 명령어

### 스케일링
```bash
# 수동 스케일링
kubectl scale deployment tepslab-server -n tepslab --replicas=5

# 자동 스케일링 비활성화
kubectl delete hpa tepslab-server-hpa -n tepslab
```

### 롤아웃 관리
```bash
# 롤아웃 상태 확인
kubectl rollout status deployment tepslab-server -n tepslab

# 이전 버전으로 롤백
kubectl rollout undo deployment tepslab-server -n tepslab

# 특정 리비전으로 롤백
kubectl rollout undo deployment tepslab-server -n tepslab --to-revision=2
```

### 디버깅
```bash
# Pod 내부 접속
kubectl exec -it -n tepslab <pod-name> -- /bin/sh

# 포트 포워딩
kubectl port-forward -n tepslab svc/tepslab-server 5000:5000
kubectl port-forward -n tepslab svc/tepslab-client 8080:80
```

---

## 보안 체크리스트

- [ ] Secrets에 실제 프로덕션 값 설정
- [ ] JWT_SECRET 강력한 랜덤 문자열로 변경
- [ ] MongoDB 인증 활성화 및 강력한 비밀번호 설정
- [ ] SSL/TLS 인증서 발급 확인
- [ ] Rate Limiting 설정 확인
- [ ] CORS 설정 확인
- [ ] 정기 백업 CronJob 활성화
- [ ] 모니터링 (Sentry, GA) 설정 완료

---

## 추가 리소스

- [Kubernetes 공식 문서](https://kubernetes.io/docs/)
- [Helm 공식 문서](https://helm.sh/docs/)
- [cert-manager 문서](https://cert-manager.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

---

## 지원

문제가 발생하면 다음을 확인하세요:
1. Pod 로그: `kubectl logs -n tepslab <pod-name>`
2. Events: `kubectl get events -n tepslab --sort-by=.metadata.creationTimestamp`
3. 리소스 상태: `kubectl get all -n tepslab`

추가 지원이 필요하면 admin@tepslab.com으로 문의하세요.
