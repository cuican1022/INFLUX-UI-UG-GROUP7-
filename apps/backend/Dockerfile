FROM node

WORKDIR /app
COPY package*.json ./

RUN npm install -g ts-node-dev
RUN npm install
# Copy source code but excluded node_modules
COPY src/ ./src/
COPY tsconfig*.json ./

EXPOSE 3005

CMD ["npm", "run", "dev"]