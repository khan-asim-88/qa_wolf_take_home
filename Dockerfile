# Use the official Node.js image as a base image
FROM node:20

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install all dependencies
RUN npm install

# Copy the entire project directory to the container
COPY . .

# Install Playwright browsers (Chromium, Firefox, and WebKit)
RUN npx playwright install --with-deps

# Default command that checks for an environment variable to decide what to run
CMD ["sh", "-c", "if [ \"$RUN\" = 'node' ]; then node index.js; elif [ \"$RUN\" = 'test' ]; then npx playwright test; else node index.js && npx playwright test; fi"]
