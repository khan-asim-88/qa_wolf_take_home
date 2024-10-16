# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install all dependencies, including Playwright
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Install Playwright browsers (Chromium, Firefox, and WebKit)
RUN npx playwright install --with-deps
