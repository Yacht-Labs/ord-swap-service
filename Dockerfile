FROM node:alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN yarn build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]