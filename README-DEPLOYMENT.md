# Appointy Deployment Guide

This guide shows how to deploy the project from start to finish in a simple way.

We will use:

- GitHub Actions for CI/CD
- Docker for containers
- Minikube for Kubernetes
- Docker Hub for storing images
- temporary public demo URLs from the GitHub Actions runner

This project has 3 apps:

- `backend` -> Express API
- `frontend` -> user app
- `admin` -> admin/doctor app

## 1. What You Need First

Install these on your machine:

- Git
- Node.js 22

Check they work:

```powershell
git --version
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
- Kubernetes demo deploy runs on a GitHub-hosted runner, not your machine

## 4. What Secrets You Really Need

You do not need MongoDB Atlas now because Minikube runs a public MongoDB image.

Required secrets:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Optional secrets:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `SONAR_HOST_URL`
- `SONAR_TOKEN`
- `CLOUDINARY_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_SECRET_KEY`

Not needed now:

- `MONGODB_URI`
- `SNYK_TOKEN`

## 5. How To Add GitHub Secrets

Open your GitHub repository.

Go to:

- `Settings`
- `Secrets and variables`
- `Actions`
- `New repository secret`

Add each secret one by one.

Also enable these GitHub security settings:

- `Private vulnerability reporting` -> `Enabled`
- `Dependabot alerts` -> `Enabled`
- `Dependabot security updates` -> `Enabled` if available

## 6. What Happens In The Pipeline

When code goes to `master`, the main pipeline runs:

1. Lint
2. Test
3. Build
4. SonarQube scan if Sonar secrets exist
5. Trivy image scan
6. Trivy filesystem SARIF scan
7. CodeQL
8. App security checks
9. Docker push
10. Kubernetes deploy

Important:

- `docker-push` runs automatically on `push` to `master`
- `k8s-deploy` also runs automatically on `push` to `master`
- `k8s-deploy` works only when your self-hosted runner is online and Minikube is already running

When you manually run the workflow, it can also:

1. Push Docker images to Docker Hub
2. Deploy to Minikube

## 7. First Automatic Run

This is the normal path now.

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
- Docker images pushed
- Kubernetes deploy does not start on push now

If Sonar secrets are missing, Sonar step will skip.

That is okay.

## 8. Temporary Demo Deploy

For the temporary demo path, GitHub Actions installs Docker, Minikube, and kubectl inside the workflow runner.

That means:

- you do not need a self-hosted runner
- you do not need local Minikube for the demo flow
- the final URLs are temporary
- the URLs stop working when the workflow job ends

## 9. Build And Push Docker Images

The easiest way is just to push to `master`.

That push already does:

- lint
- test
- build
- scan
- Docker push

You can still do a manual workflow run if you want to rerun image push without another code change.

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

## 10. Deploy To Minikube

For the temporary demo, deployment is manual.

Run the workflow manually from GitHub:

- `Actions`
- `CI-CD Pipeline`
- `Run workflow`

This time use:

- `image_tag` -> `latest`
- `run_deploy` -> `true`
- `demo_minutes` -> `30`
- `run_dast` -> `false`
- `target_url` -> leave empty

This will:

1. Push images if needed
2. Install Docker, kubectl, Minikube, and cloudflared on the GitHub runner
3. Deploy MongoDB in Minikube
4. Deploy backend
5. Deploy frontend
6. Deploy admin
7. Generate temporary public links

At the end, the workflow prints:

- frontend URL
- admin URL
- these links stay alive only while the job is running

## 11. What Kubernetes Creates

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

## 12. Check If Pods Are Running

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

## 13. Open The Apps

Open the frontend and admin URLs from the workflow summary.

Important:

- they are temporary demo links
- they stop working when the GitHub job ends

## 14. Admin Login

Use the values you stored in GitHub secrets:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

That logs you into the admin panel.

## 15. Add Doctors Without Cloudinary

Cloudinary is optional now.

That means:

- you can add a doctor without image hosting
- the app uses a built-in placeholder image

So even without Cloudinary, admin flows still work.

## 16. Payments Without Razorpay

Razorpay is optional for deployment.

If you do not care about payment right now, the app can still run.

The payment flow just should not be tested until valid Razorpay keys exist.

## 17. If Something Fails

Use this order to debug:

1. Check GitHub Actions logs
2. Check Docker Hub images were pushed
3. Check manual deploy was started with `run_deploy=true`
4. Check Minikube install/start step in the workflow
5. Check Kubernetes pods
6. Check pod logs

Useful commands:

```powershell
docker images
```

## 18. Full End-To-End Order

Follow exactly this order:

1. Install tools
2. Add GitHub secrets
3. Enable GitHub security settings
4. Push code to `master`
5. Let `CI-CD Pipeline` run lint, test, build, scans, and Docker push
6. Go to `Actions` and run `CI-CD Pipeline` manually with `run_deploy=true`
7. Wait for the Kubernetes demo deployment
8. Check Docker Hub images
9. Copy the temporary frontend and admin URLs from the workflow summary
10. Open them before the job ends

## 19. Very Short Version

If you want the short version, do this:

Then in GitHub:

1. Add secrets
2. Push code to `master`
3. Run `CI-CD Pipeline` manually with `run_deploy=true`
4. Open the temporary URLs from the workflow summary

## 20. What Is Already Ready In This Project

Already prepared for you:

- modular reusable workflows
- one main pipeline workflow
- Dockerfiles
- Kubernetes manifests
- MongoDB in Minikube using public image
- health checks
- backend smoke test
- Trivy scanning
- Trivy filesystem SARIF scan
- CodeQL and dependency review support
- Dependabot config
- optional SonarQube
- optional Cloudinary
- optional manual Snyk only if you add a token
- GitHub Actions temporary Minikube demo deploy
- temporary public tunnel URLs during the deploy job

## 21. Final Note

For a college project, demo, viva, or beginner DevSecOps presentation, this setup is strong enough:

- CI
- CD
- containers
- Kubernetes
- vulnerability scanning
- static analysis support
- modular workflow design

For a real stable final public link later, move from this temporary GitHub Actions demo to a persistent host or your own machine.

Later, if you want, you can improve it with:

- Ingress
- TLS
- Helm charts
- managed MongoDB
- production secrets manager
- better tests
