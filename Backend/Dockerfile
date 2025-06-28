# Use the official Node.js 18 LTS image as the base
FROM node
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
# This step installs dependencies only if package.json or package-lock.json changes
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend application code
COPY . .

# Expose the port the backend server listens on (default 5000)
EXPOSE 5000

# Command to run the application
# npm start typically runs 'node server.js' as defined in package.json
CMD [ "node", "server.js" ]
