# Use official Node.js runtime as the base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Playwright browsers
RUN npx playwright install --with-deps

# Copy the rest of the application code
COPY . .

# Expose the application port (optional)
EXPOSE 3000

# Default command to run the application
CMD ["node", "index.js"]
