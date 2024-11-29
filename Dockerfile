FROM node:20.18.0-alpine3.19

# Tạo thư mục làm việc
WORKDIR /home/node/backend

# Sao chép package.json và cài đặt dependency
COPY package*.json ./
RUN npm install

# Sao chép mã nguồn
COPY . .

# Build ứng dụng
RUN npm run build

ENV NODE_ENV=production

# Mở port 3000 (ghi chú port ứng dụng sử dụng)
EXPOSE 6575

# Khởi chạy server
CMD ["npm", "run", "start:prod"]


# docker build --tag node-backend . 
# docker run -p 3000:3000 -d node-backend