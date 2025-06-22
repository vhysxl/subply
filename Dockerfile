# core package
FROM node:22.14.0-alpine 

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# copy all files
COPY . .

# Expose port
EXPOSE 5000

#run the app
CMD ["npm", "run", "start"]