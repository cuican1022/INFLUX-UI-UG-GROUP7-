FROM node

# Set working directory and copy package files
WORKDIR /app
COPY package*.json ./

# Install dependencies, copy source code and expose port
RUN npm install
COPY . .
EXPOSE 5184

# Start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5184"]
