# 📚 Lectio  

> Plataforma web full-stack para la gestión de contenido de lectura  
> Arquitectura cliente-servidor desacoplada | API REST

---

## ✨ ¿Qué es Lectio?

**Lectio** es una aplicación web diseñada para gestionar contenido estructurado relacionado con lectura (libros u otros recursos).

El proyecto está construido siguiendo una arquitectura moderna separando:

- 🖥️ **Frontend** → Interfaz de usuario
- 🔌 **Backend (lectio-api)** → API REST
- 🗄️ **Base de datos** → Persistencia de la información

El objetivo es ofrecer una base sólida, escalable y mantenible que cualquier desarrollador pueda clonar, ejecutar y ampliar fácilmente.

---

# 🏗️ Arquitectura

```
┌─────────────────┐
│    Frontend     │
│  (Aplicación)   │
└────────┬────────┘
         │ HTTP / JSON
         ▼
┌─────────────────┐
│     API REST    │
│  (lectio-api)   │
└────────┬────────┘
         ▼
     Base de Datos
```

✔ Separación de responsabilidades  
✔ Comunicación mediante JSON  
✔ Arquitectura escalable  

---

# 📂 Estructura del Proyecto

```
Lectio/
├── Frontend/          # Cliente web
├── lectio-api/        # API backend
├── .gitignore
└── README.md
```

---

# 🚀 Tecnologías Utilizadas

## 🖥️ Frontend
- HTML5
- CSS3
- TypeScript / JavaScript
- Framework SPA (Angular / React si aplica)
- Consumo de API REST

## 🔌 Backend
- Entorno Node.js / Java (según implementación)
- API REST
- Controladores y rutas
- Gestión de datos
- Conexión a base de datos

---

# ⚙️ Requisitos Previos

Antes de empezar necesitas tener instalado:

- Git
- Node.js (versión LTS recomendada)
- npm
- Base de datos configurada (si aplica)

Comprobar instalación:

```bash
node -v
npm -v
git --version
```

---

# 📥 Instalación

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Fitboxer/Lectio.git
cd Lectio
```

---

## 2️⃣ Configurar y ejecutar el Backend

```bash
cd lectio-api
npm install
npm start
```

Si el proyecto usa variables de entorno, crea un archivo `.env`:

```env
PORT=8080
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=lectio
```

La API estará disponible en:

```
http://localhost:8080
```

---

## 3️⃣ Configurar y ejecutar el Frontend

En otra terminal:

```bash
cd Frontend
npm install
npm start
```

La aplicación estará disponible en:

```
http://localhost:4200
```

---

# 🔗 Ejemplo de Endpoints

| Método | Endpoint | Descripción |
|--------|----------|------------|
| GET | /api/libros | Obtener todos los libros |
| GET | /api/libros/:id | Obtener libro por ID |
| POST | /api/libros | Crear libro |
| PUT | /api/libros/:id | Actualizar libro |
| DELETE | /api/libros/:id | Eliminar libro |

Ejemplo de respuesta:

```json
{
  "id": 1,
  "titulo": "Ejemplo",
  "autor": "Autor",
  "descripcion": "Descripción del libro"
}
```

---

# 🧪 Testing

Backend:

```bash
cd lectio-api
npm test
```

Frontend:

```bash
cd Frontend
npm test
```

---

# 📦 Build para Producción

## Frontend

```bash
npm run build
```

Genera la carpeta `dist/` lista para desplegar.

## Backend

```bash
NODE_ENV=production
npm start
```

---

# 🌍 Despliegue

El proyecto está preparado para desplegarse en:

- Servidores VPS
- AWS
- Railway
- Docker
- Hosting tradicional

Puede añadirse fácilmente un `docker-compose.yml` para levantar toda la infraestructura con un solo comando.

---

# 🛠️ Posibles Mejoras Futuras

- Autenticación de usuarios
- Gestión de perfiles
- Dashboard con estadísticas
- Sistema de favoritos
- Contenerización con Docker
- CI/CD

---

# 🤝 Contribución

1. Haz un fork
2. Crea una rama:

```bash
git checkout -b feature/nueva-funcionalidad
```

3. Haz commit
4. Push
5. Abre un Pull Request

---

# 📄 Licencia

Actualmente sin licencia definida.  
Se recomienda añadir MIT License si se desea permitir uso libre del proyecto.

---

# 📌 Estado del Proyecto

Proyecto en desarrollo  
Orientado a entorno académico / demostración full-stack  
Escalable y ampliable  
