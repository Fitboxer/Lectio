📘 Lectio

Lectio es una aplicación web full-stack basada en arquitectura cliente-servidor, compuesta por:

🖥️ Un Frontend (aplicación web)

🔌 Una API Backend (lectio-api)

El sistema está diseñado para gestionar información relacionada con lectura/contenido estructurado mediante una API REST conectada a una interfaz web.

🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura desacoplada:

Cliente (Frontend)
        ↓
   API REST (Backend)
        ↓
   Base de Datos

El Frontend consume la API mediante peticiones HTTP.

El Backend gestiona la lógica de negocio y el acceso a datos.

La comunicación se realiza en formato JSON.

📂 Estructura del Repositorio
Lectio/
├── Frontend/          # Aplicación web cliente
├── lectio-api/        # API REST backend
├── .gitignore
└── README.md
🚀 Tecnologías Utilizadas

(Ajustar si fuera necesario según el stack real del proyecto)

Frontend

HTML5

CSS3

TypeScript / JavaScript

Framework SPA (Angular / React si aplica)

Consumo de API REST con HTTP

Backend

Node.js / Java / otro entorno backend

API REST

Gestión de rutas y controladores

Conexión a base de datos (si aplica)

⚙️ Requisitos Previos

Antes de ejecutar el proyecto debes tener instalado:

✅ Git

✅ Node.js (versión LTS recomendada)

✅ npm (incluido con Node)

✅ Base de datos configurada (si el backend la requiere)

Comprobar versiones:

node -v
npm -v
git --version
📥 Instalación Paso a Paso
1️⃣ Clonar el repositorio
git clone https://github.com/Fitboxer/Lectio.git
cd Lectio
2️⃣ Configurar el Backend (API)
cd lectio-api
npm install

Si existe archivo .env, crear uno basado en .env.example:

cp .env.example .env

Configurar variables necesarias (puerto, base de datos, etc).

3️⃣ Ejecutar el Backend
npm start

O en modo desarrollo:

npm run dev

Por defecto la API debería ejecutarse en:

http://localhost:8080

(Verificar puerto en configuración del proyecto).

4️⃣ Configurar el Frontend

En otra terminal:

cd Frontend
npm install

Verificar que la URL del backend esté configurada correctamente en los archivos de entorno:

Ejemplo:

environment.ts
apiUrl = 'http://localhost:8080'
5️⃣ Ejecutar el Frontend
npm start

O (según framework):

ng serve

La aplicación estará disponible en:

http://localhost:4200
🔗 Endpoints Principales (Ejemplo)

(Modificar según tu API real)

Método	Endpoint	Descripción
GET	/api/libros	Obtener todos los libros
GET	/api/libros/:id	Obtener libro por ID
POST	/api/libros	Crear libro
PUT	/api/libros/:id	Actualizar libro
DELETE	/api/libros/:id	Eliminar libro

Formato de respuesta:

{
  "id": 1,
  "titulo": "Ejemplo",
  "autor": "Autor",
  "descripcion": "Descripción del libro"
}
🧪 Testing

Para ejecutar los tests:

Backend:

cd lectio-api
npm test

Frontend:

cd Frontend
npm test
🛠️ Scripts Disponibles

Ejemplo típico:

Backend

npm start → Ejecutar servidor

npm run dev → Ejecutar en modo desarrollo

npm test → Ejecutar tests

Frontend

npm start → Servidor de desarrollo

npm run build → Build producción

npm test → Tests

📦 Build para Producción
Frontend
npm run build

Generará carpeta dist/ lista para desplegar.

Backend

Configurar variables de entorno en producción:

NODE_ENV=production
PORT=8080

Ejecutar:

npm start
🌍 Despliegue

El proyecto puede desplegarse en:

AWS

Heroku

Vercel (frontend)

Railway

Docker

Si se desea contenerizar, crear:

Dockerfile para backend

Dockerfile para frontend

docker-compose.yml para orquestación

🔐 Variables de Entorno (Ejemplo)
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=lectio

Nunca subir el archivo .env al repositorio.

🤝 Contribución

Crear fork

Crear rama nueva:

git checkout -b feature/nueva-funcionalidad

Commit con mensaje claro

Push

Pull Request

📄 Licencia

Actualmente el proyecto no tiene licencia definida.

Se recomienda añadir MIT si se desea permitir uso libre del proyecto.

📌 Estado del Proyecto

🚧 En desarrollo / Proyecto académico
Arquitectura escalable preparada para ampliación de funcionalidades.
