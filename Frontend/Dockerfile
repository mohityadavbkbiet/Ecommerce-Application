# Use the official Node.js 18 LTS image as the base
FROM node

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy the rest of the frontend application code
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Command to run the Vite development server, making it accessible from outside the container
# --host 0.0.0.0 is crucial for Docker to bind to all network interfaces
# --port 5173 explicitly sets the port within the container
CMD [ "npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173" ]