FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY server.js ./
COPY db ./db
RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

ENV NODE_ENV=production
EXPOSE 3000

USER node
CMD ["npm", "start"]
