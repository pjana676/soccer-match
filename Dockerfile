# Use a base Node.js image
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install -g npm@9.8.1
RUN npm install

# Copy application files
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Specify the command to run your Node.js application
CMD npm start
# CMD ["npm", "run", "set"]