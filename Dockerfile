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

# Build the app
RUN npm run build

# Expose port
ENV PORT=8080
EXPOSE 8080

#run the app
CMD ["node", "dist/src/main.js"]