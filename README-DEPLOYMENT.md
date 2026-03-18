# Appointy Deployment Guide

This guide shows how to deploy the project from start to finish in a simple way.

We will use:

- GitHub Actions for CI/CD
- Docker for containers
- Minikube for Kubernetes
- Docker Hub for storing images

This project has 3 apps:

- `backend` -> Express API
- `frontend` -> user app
- `admin` -> admin/doctor app

## 1. What You Need First

Install these on your machine:

- Git
- Docker Desktop
- Minikube
- kubectl
- Node.js 22

Check they work:

```powershell
git --version
docker --version
minikube version
kubectl version --client
node --version
npm --version
```

## 2. Put Code In GitHub

Make sure your project is pushed to the `master` branch.

Check current branch:

```powershell
git branch
```

Push to GitHub:

```powershell
git add .
git commit -m "Add DevSecOps deployment setup"
git push origin master
```

## 3. What Workflows Exist

You now have one main workflow:

- `.github/workflows/pipeline.yml`

This one workflow calls all the others inside it.

That means:

- GitHub shows one main pipeline
- Internally it still runs lint, test, build, scans, push, and deploy in order

## 4. What Secrets You Really Need

You do not need SonarQube now.

You do not need Cloudinary now.

You do not need MongoDB Atlas now because Minikube will run a public MongoDB image.

Add these GitHub repository secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

Optional secrets:

- `SONAR_HOST_URL`
- `SONAR_TOKEN`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET_KEY`

## 5. How To Add GitHub Secrets

Open your GitHub repository.

Go to:

- `Settings`
- `Secrets and variables`
- `Actions`
- `New repository secret`

Add each secret one by one.

## 6. What Happens In The Pipeline

When code goes to `master`, the main pipeline runs:

1. Lint
2. Test
3. Build
4. SonarQube scan if Sonar secrets exist
5. Trivy scan
6. App security checks

When you manually run the workflow, it can also:

1. Push Docker images to Docker Hub
2. Deploy to Minikube

## 7. First Run Without Deployment

This is the safest first test.

Push code to `master`.

Then open:

- GitHub
- `Actions`
- `CI-CD Pipeline`

You should see:

- lint running
- test running
- build running
- scans running

If Sonar secrets are missing, Sonar step will skip.

That is okay.

## 8. Start Minikube Locally

Start Minikube:

```powershell
minikube start --driver=docker
```

Check Minikube:

```powershell
minikube status
kubectl get nodes
```

If it is healthy, continue.

## 9. Create A Self-Hosted GitHub Runner

This is important.

Kubernetes deploy uses your local Minikube.

GitHub cloud runners cannot see your local Minikube.

So you need a self-hosted runner on your own machine.

Open GitHub repo:

- `Settings`
- `Actions`
- `Runners`
- `New self-hosted runner`

Choose:

- Windows

GitHub will show commands.

Run them on your machine in a new folder.

Then start the runner.

Keep that terminal open while deployment runs.

## 10. Build And Push Docker Images

Now do a manual workflow run.

Go to:

- GitHub
- `Actions`
- `CI-CD Pipeline`
- `Run workflow`

Fill:

- `image_tag` -> `latest`
- `run_deploy` -> `false`
- `run_dast` -> `false`
- `target_url` -> leave empty

This run will:

- lint
- test
- build
- scan
- push Docker images to Docker Hub

After success, check Docker Hub.

You should see:

- `appointy-backend`
- `appointy-frontend`
- `appointy-admin`

## 11. Deploy To Minikube

Run the workflow again manually.

This time use:

- `image_tag` -> `latest`
- `run_deploy` -> `true`
- `run_dast` -> `false`
- `target_url` -> leave empty

This will:

1. Push images if needed
2. Use your self-hosted runner
3. Deploy MongoDB in Minikube
4. Deploy backend
5. Deploy frontend
6. Deploy admin

## 12. What Kubernetes Creates

Kubernetes files are in the `k8s` folder:

- `namespace.yaml`
- `mongodb.yaml`
- `backend-configmap.yaml`
- `backend.yaml`
- `frontend.yaml`
- `admin.yaml`

These create:

- one namespace called `appointy`
- one MongoDB deployment
- one backend deployment and service
- one frontend deployment and service
- one admin deployment and service

## 13. Check If Pods Are Running

Run:

```powershell
kubectl get all -n appointy
```

You should see pods for:

- mongodb
- backend
- frontend
- admin

If something fails, inspect:

```powershell
kubectl get pods -n appointy
kubectl describe pod <pod-name> -n appointy
kubectl logs <pod-name> -n appointy
```

## 14. Open The Apps

Get the frontend URL:

```powershell
minikube service frontend-service -n appointy --url
```

Get the admin URL:

```powershell
minikube service admin-service -n appointy --url
```

Open those URLs in your browser.

## 15. Admin Login

Use the values you stored in GitHub secrets:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

That logs you into the admin panel.

## 16. Add Doctors Without Cloudinary

Cloudinary is optional now.

That means:

- you can add a doctor without image hosting
- the app uses a built-in placeholder image

So even without Cloudinary, admin flows still work.

## 17. Payments Without Razorpay

Razorpay is still expected if you want payment features.

If you do not care about payment right now, the app can still run.

The payment flow just should not be tested until valid Razorpay keys exist.

## 18. If Something Fails

Use this order to debug:

1. Check GitHub Actions logs
2. Check Docker Hub images were pushed
3. Check Minikube is running
4. Check self-hosted runner is online
5. Check Kubernetes pods
6. Check pod logs

Useful commands:

```powershell
docker images
minikube status
kubectl get all -n appointy
kubectl get pods -n appointy
kubectl logs deployment/backend -n appointy
kubectl logs deployment/frontend -n appointy
kubectl logs deployment/admin -n appointy
kubectl logs deployment/mongodb -n appointy
```

## 19. Full End-To-End Order

Follow exactly this order:

1. Install tools
2. Push code to `master`
3. Add GitHub secrets
4. Start Minikube
5. Create self-hosted GitHub runner on your machine
6. Push code and let normal pipeline validate lint, test, build, and scans
7. Manually run pipeline with `run_deploy=false` to push Docker images
8. Manually run pipeline with `run_deploy=true` to deploy to Minikube
9. Check pods in Kubernetes
10. Open frontend and admin service URLs

## 20. Very Short Version

If you want the short version, do this:

```powershell
minikube start --driver=docker
kubectl get nodes
```

Then in GitHub:

1. Add secrets
2. Start self-hosted runner
3. Run `CI-CD Pipeline`
4. First run with deploy off
5. Second run with deploy on

Then:

```powershell
minikube service frontend-service -n appointy --url
minikube service admin-service -n appointy --url
```

## 21. What Is Already Ready In This Project

Already prepared for you:

- modular reusable workflows
- one main pipeline workflow
- Dockerfiles
- Kubernetes manifests
- MongoDB in Minikube using public image
- health checks
- backend smoke test
- Trivy scanning
- CodeQL and dependency review support
- optional SonarQube
- optional Cloudinary

## 22. Final Note

For a college project, demo, viva, or beginner DevSecOps presentation, this setup is strong enough:

- CI
- CD
- containers
- Kubernetes
- vulnerability scanning
- static analysis support
- modular workflow design

Later, if you want, you can improve it with:

- Ingress
- TLS
- Helm charts
- managed MongoDB
- production secrets manager
- better tests
