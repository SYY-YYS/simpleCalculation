FROM node:23-alpine

WORKDIR /mathbackend

COPY package*.json ./

# COPY ./src ./src
# COPY ./public ./public

RUN npm install

COPY . .

EXPOSE 8030

CMD [ "node", "express.js"]
