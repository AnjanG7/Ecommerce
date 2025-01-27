FROM node:20.13.1-alpine


WORKDIR /usr/app

# Copy package json and yarn lock only to optimise the image building
COPY package.json yarn.lock ./


RUN yarn install --pure-lockfile

COPY  . .

EXPOSE 8010

CMD [ "yarn", "dev" ]