# Use a base Node.js image
FROM node:18.16.1
WORKDIR /app

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json .


# Install dependencies
RUN apk add --no-cache ffmpeg opus pixman cairo pango giflib ca-certificates \
    && apk add --no-cache --virtual .build-deps python g++ make gcc .build-deps curl git pixman-dev cairo-dev pangomm-dev libjpeg-turbo-dev giflib-dev \
    && npm install \
    && apk del .build-deps

# Copy application files
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Specify the command to run your Node.js application
CMD npm run set && npm start
# CMD ["npm", "run", "set"]