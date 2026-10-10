# Use official lightweight Node.js 20 Alpine image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the backend source code
COPY . .

# Expose the API port
EXPOSE 5000

# Default command to start the API server
# (We will override this in docker-compose for the Worker)
CMD ["npm", "run", "start"]
