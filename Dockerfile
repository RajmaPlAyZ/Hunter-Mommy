# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the entire content of the current directory into the container
COPY . .

# Install dependencies
RUN npm install

# Expose the port your app will run on
EXPOSE 8000

# Command to run your application
CMD ["node", "run.js"]

