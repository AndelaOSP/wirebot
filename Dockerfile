#Create our image from Node alpine
FROM node:alpine

LABEL maintainer "Vicky<victoria.aoka@andela.com>"

LABEL application="wirebot"

ADD . /app

WORKDIR /app

RUN yarn install

EXPOSE 3000

CMD [ "npm", "start" ]



