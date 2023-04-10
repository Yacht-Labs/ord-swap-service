FROM node:lts
WORKDIR /usr/src/app
COPY package*.json ./
COPY ./src/abis/*.json ./src/abis/
RUN yarn install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN yarn build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]