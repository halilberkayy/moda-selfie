FROM node:18-alpine

WORKDIR /app

# Package dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install --production

# Kaynak kodu kopyala
COPY ./src ./src

EXPOSE 5000

CMD ["node", "src/index.js"]