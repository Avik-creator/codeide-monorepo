FROM debian:latest

# Install necessary packages including Node.js, npm, and build tools
RUN apt-get update && \
    apt-get install -y curl bash python3 make gcc g++ build-essential libutempter0 && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs default-jdk g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm

# Set the working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml and turbo.json
COPY package.json pnpm-lock.yaml* turbo.json ./

# Copy the rest of the monorepo
COPY . .

# Install dependencies
RUN pnpm install

# Expose ports for the API and web application
EXPOSE 9000 3001 3000 3002 3003

# Start the application
CMD ["pnpm", "run", "dev"]