# Build stage
FROM node:18 as build

WORKDIR /app

# Accept build arguments
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID
ARG VITE_KEYCLOAK_REDIRECT_URI
ARG VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI
ARG VITE_API_URL

# Set environment variables for build
ENV VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL
ENV VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM
ENV VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID
ENV VITE_KEYCLOAK_REDIRECT_URI=$VITE_KEYCLOAK_REDIRECT_URI
ENV VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI=$VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI
ENV VITE_API_URL=$VITE_API_URL

# Debug: Print environment variables
RUN echo "VITE_KEYCLOAK_URL: $VITE_KEYCLOAK_URL"
RUN echo "VITE_KEYCLOAK_REALM: $VITE_KEYCLOAK_REALM"
RUN echo "VITE_KEYCLOAK_CLIENT_ID: $VITE_KEYCLOAK_CLIENT_ID"
RUN echo "VITE_KEYCLOAK_REDIRECT_URI: $VITE_KEYCLOAK_REDIRECT_URI"
RUN echo "VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI: $VITE_KEYCLOAK_POST_LOGOUT_REDIRECT_URI"
RUN echo "VITE_API_URL: $VITE_API_URL"

# Copy only the web app files
COPY apps/web/package.json apps/web/pnpm-lock.yaml ./
COPY apps/web/ ./

# Install pnpm, turbo, and required type definitions
RUN npm install -g pnpm turbo
RUN pnpm install

# Build the project using Turbo
RUN pnpm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/robots.txt /usr/share/nginx/html/robots.txt

COPY <<'EOF' /docker-entrypoint.d/01-insert-window-variable.sh
#!/bin/sh

set -eu

cp /usr/share/nginx/html/index.html /usr/share/nginx/html/index.html.template
envsubst < /usr/share/nginx/html/index.html.template > /usr/share/nginx/html/index.html 
rm /usr/share/nginx/html/index.html.template

EOF

RUN chmod +x /docker-entrypoint.d/01-insert-window-variable.sh

EXPOSE 8000
