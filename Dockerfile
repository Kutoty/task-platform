FROM node:22-slim
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY tsconfig.json schema.sql ./
COPY src src
RUN npx tsc -p tsconfig.json
EXPOSE 3000
CMD ["node", "dist/main.js"]
