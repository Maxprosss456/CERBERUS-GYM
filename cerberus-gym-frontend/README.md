# Cerberus GYM — Panel de Gestión de Socios (Front-end)

Panel privado de administración para el gimnasio Cerberus GYM. Hecho con
**React + Vite**, empaquetado como app de escritorio con **Electron**.

## Cómo correrlo

```bash
npm install
npm run electron:dev
```

Esto levanta Vite en modo desarrollo y abre la ventana de Electron
apuntando a esa build (con recarga en caliente). Si solo querés ver la
interfaz en el navegador, sin Electron:

```bash
npm run dev
```

## Estructura

```
src/
  components/
    Login/           Pantalla de login
    Layout/           Sidebar + layout general del panel
    Socios/           Listado, tarjeta, alta y ficha de socio
    Pagos/             Pendientes / Próximos / Registros
    Calendario/        Calendario mensual con alertas de vencimiento
    Configuracion/     Preferencias de interfaz
    Modal.jsx          Modal genérico reutilizable
  data/
    socios.js          ⚠️ Único archivo a tocar para conectar la API real
    pagos.js           ⚠️ Único archivo a tocar para conectar la API real
  mockData.js           Datos de prueba (se van a reemplazar por la API)
  utils/fechas.js       Utilidades de fecha para el calendario
electron/
  main.js               Proceso principal de Electron
  preload.js             Puente para exponer IPC cuando haga falta
```

## Conectar con el backend real

Los componentes NO llaman a `mockData.js` directamente — todos pasan por
`src/data/socios.js` y `src/data/pagos.js`. Cuando el equipo de backend
tenga la API lista, alcanza con reemplazar el cuerpo de cada función ahí
por un `fetch()` real, manteniendo la misma forma de objeto que ya usa el
mock. Ningún componente debería necesitar cambios.

Ejemplo:

```js
// src/data/socios.js
export async function obtenerSocios() {
  const res = await fetch("http://localhost:3000/api/socios");
  return res.json();
}
```

## Paleta de colores

| Color | Hex |
|---|---|
| Verde Cerberus | `#94e006` |
| Negro | `#000000` |
| Gris oscuro (paneles) | `#292a27` |
| Alerta (pago vencido) | `#ef4444` |
| Advertencia (pago por vencer) | `#eab308` |

## Estado actual / pendiente

- El logo usado es la versión provisoria sin fondo — reemplazar
  `src/assets/logo-cerberus.png` cuando esté el logo final.
- El login es mock: cualquier usuario/contraseña no vacíos ingresan.
- "Seleccionar Foto" en el alta de socio todavía no sube archivos de
  verdad (falta definir con el equipo cómo se va a manejar el storage
  de imágenes).
- Configuración es solo visual por ahora (no persiste la preferencia).
