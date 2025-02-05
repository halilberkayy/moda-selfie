FROM node:18-alpine

WORKDIR /app

# Package dosyalarını kopyala ve bağımlılıkları yükle
COPY package*.json ./
RUN npm install --production

# Kaynak kodu kopyala
COPY . .

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "start"]