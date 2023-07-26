# Use a base Node.js image
FROM node:18.16.1

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install -g npm@9.8.0

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Specify the command to run your Node.js application
CMD npm run set && npm start
# CMD ["npm", "run", "set"]