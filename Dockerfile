FROM node AS builder

WORKDIR /app

RUN --mount=type=secret,id=firebase_key cp /run/secrets/firebase_key /app/firebase_key.json
RUN --mount=type=secret,id=env_file cp /run/secrets/env_file /app/.env

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

RUN npx prisma generate

COPY . .

RUN npm run build

FROM node

COPY --from=builder /app/package*.json ./
RUN npm install
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/firebase_key.json ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8000

CMD npx prisma migrate deploy ; npm run start:prod 