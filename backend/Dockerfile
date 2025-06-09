# Use official Node.js runtime as a parent image
FROM node:20

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all app files
COPY . .

# Command to run your app
CMD ["node", "app.js"]

