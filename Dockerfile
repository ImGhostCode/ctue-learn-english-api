FROM node AS builder

# Create app directory
WORKDIR /app

RUN --mount=type=file,id=firebase_key cp /run/secrets/firebase_key /app

RUN ls -l cp /run/secrets/firebase_key

RUN ls -l /run/secrets

RUN ls -l /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

EXPOSE 8000
CMD [ "npm", "run", "start:prod" ]