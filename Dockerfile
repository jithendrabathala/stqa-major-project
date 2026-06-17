FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency descriptors
COPY package.json pnpm-lock.yaml ./

# Install packages
RUN pnpm install --frozen-lockfile

# Copy the application source code
COPY . .

# Expose the app port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
