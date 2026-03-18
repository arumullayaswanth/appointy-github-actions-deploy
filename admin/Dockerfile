FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_BACKEND_URL=
ARG VITE_CURRENCY=INR
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_CURRENCY=${VITE_CURRENCY}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV BACKEND_UPSTREAM=http://backend-service:4000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
