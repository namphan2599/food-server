FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (excluding node_modules)
COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 3001

# Start the application using the built files
CMD ["node", "dist/app.js"]