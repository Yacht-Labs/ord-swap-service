FROM node:lts
WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install --frozen-lockfile
RUN npx prisma generate
RUN yarn build
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]