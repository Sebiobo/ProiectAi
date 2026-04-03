# 1. Folosim o versiune oficială și ușoară de Node.js
FROM node:22-alpine

# 2. Setăm folderul de lucru în interiorul containerului
WORKDIR /app

# 3. Copiem fișierele package.json și package-lock.json (dacă există)
COPY package*.json ./

# 4. Instalăm dependențele
RUN npm install

# 5. Copiem tot restul codului sursă
COPY . .

# 6. Vite folosește standard portul 5173, așa că îl expunem
EXPOSE 5173

# 7. Comanda de start. Adăugăm "--host" ca să expunem serverul Vite în afara containerului
CMD ["npm", "run", "dev", "--", "--host"]