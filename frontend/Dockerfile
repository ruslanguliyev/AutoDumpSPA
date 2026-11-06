# AvtoBaz frontend: build the Vite app, serve it with nginx. Build context: ./frontend
FROM node:24-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# "/graphql" is relative: nginx (see nginx.conf) proxies it to the backend, so the same image
# works on any domain and there are no CORS problems.
ARG VITE_API_URL=/graphql
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
