# Cerberus GYM

Panel de administración para un gimnasio: gestión de socios, control de pagos y calendario de vencimientos.

- **Frontend:** React + Vite + React Router
- **Backend:** Node.js + Express
- **Base de datos:** Supabase (PostgreSQL)
- **Hosting:** Render (frontend y backend) + Supabase (base de datos)

## Funcionalidades

- Login con usuario y contraseña
- **Socios:** alta, edición, baja y búsqueda por nombre o DNI
- **Pagos:** cuotas generadas automáticamente, registro por Efectivo, Transferencia o Pago mixto, y posibilidad de deshacer
- **Calendario:** vista mensual de vencimientos, pagos por vencer y pagos registrados
- **Configuración:** tamaño de fuente, precio de la mensualidad y días de anticipación para los avisos

## Requisitos

- [Node.js](https://nodejs.org/) **20.19 o superior** (requerido por Vite 7)
- npm (viene con Node.js)
- [Git](https://git-scm.com/)
- Una cuenta gratuita en [Supabase](https://supabase.com/)

---

## 1. Ejecución local

### Clonar el repositorio

```powerShell
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

### Backend

```powerShell
cd cerberus-gym-backend
npm install
```

Creá un archivo `.env` dentro de `cerberus-gym-backend/`:

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_KEY=tu_service_role_key
ADMIN_USER=tu_usuario
ADMIN_PASSWORD=tu_contraseña
PORT=5000
```

| Variable | Descripción |
|----------|-------------|
| `SUPABASE_URL` | URL del proyecto de Supabase |
| `SUPABASE_KEY` | Clave `service_role` de Supabase |
| `ADMIN_USER` | Usuario para ingresar al panel |
| `ADMIN_PASSWORD` | Contraseña para ingresar al panel |
| `PORT` | Puerto del servidor|

Levantá el servidor:

```bash
node server.js
```

Debería mostrar `Servidor con Supabase corriendo en http://localhost:5000`.

### Frontend

En otra terminal:

```powerShell
cd cerberus-gym-frontend
npm install
```

Creá un archivo `.env` dentro de `cerberus-gym-frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

Levantá el servidor de desarrollo:

```powerShell
npm run dev
```

Abrí [http://localhost:5173](http://localhost:5173) e iniciá sesión con el `ADMIN_USER` y `ADMIN_PASSWORD` que configuraste.

---

## 2. Publicación (Render)

Orden recomendado: primero el backend y luego el frontend, porque el frontend necesita la URL del backend.

Subí antes todo el código a GitHub. Los archivos `.env` **no** deben subirse (están en el `.gitignore`).

### Backend en Render

1. En [render.com](https://render.com/): **New → Web Service** y conectá el repositorio.
2. Configuración:

   | Campo | Valor |
   |-------|-------|
   | Root Directory | `cerberus-gym-backend` |
   | Build Command | `npm install` |
   | Start Command | `node server.js` |

3. En **Environment**, cargá las variables: `SUPABASE_URL`, `SUPABASE_KEY`, `ADMIN_USER` y `ADMIN_PASSWORD`. No hace falta definir `PORT`, Render lo asigna solo.
4. Desplegá y copiá la URL pública que te asigna (por ejemplo `https://cerberus-gym-backend.onrender.com`).

### Frontend en Render

El frontend se compila a archivos estáticos, por eso **debe crearse como Static Site** y no como Web Service (si no, aparece el error `Command "start" not found`).

1. **New → Static Site** y conectá el mismo repositorio.
2. Configuración:

   | Campo | Valor |
   |-------|-------|
   | Root Directory | `cerberus-gym-frontend` |
   | Build Command | `npm install && npm run build` |
   | Publish Directory | `dist` |

3. En **Environment**, agregá:

   ```
   VITE_API_URL=https://tu-backend.onrender.com
   ```

4. En **Redirects/Rewrites**, agregá esta regla para que las rutas de React Router sigan funcionando al recargar la página:

   | Source | Destination | Action |
   |--------|-------------|--------|
   | `/*` | `/index.html` | **Rewrite** |
