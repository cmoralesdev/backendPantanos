# PESCA SEGURA – Backend

Este repositorio contiene el backend de la aplicación web "Pesca Segura", desarrollada con Node.js y Express. Expone una serie de endpoints que permiten la gestión de pantanos, guías y reservas.

## Funcionalidades

- Exposición de endpoints RESTful para el frontend
- Gestión de pantanos, guías y reservas
- Integración con Firestore como base de datos
- Validación de peticiones

> Nota: La autenticación de usuarios y el almacenamiento de datos personales se gestiona directamente en el frontend mediante Firebase Authentication y Firestore.

## Instalación

1. Clonar el repositorio:  
   `git clone https://github.com/cmoralesdev/backendPantanos`

2. Instalar dependencias:  
   `npm install`

3. Ejecutar el servidor:  
   `npm run dev`

## Dependencias principales (`package.json`)

- "cors": "^2.8.5"
- "dotenv": "^16.5.0"
- "express": "^5.1.0"
- "firebase-admin": "^13.3.0"

## Autor

Carlos Morales Moraleda
