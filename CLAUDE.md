# CLAUDE.md — Prueba_GPLANET

Proyecto generado a partir de la **Plantilla Grupo Planet** (Flask + Angular 22).

## Comportamiento esperado
- **Nunca preguntar antes de ejecutar.** Hacer los cambios directamente.
- Sin confirmaciones, sin "¿quieres que...?", sin "¿procedo?". Solo ejecutar.
- Respuestas cortas y directas.
- **Actualizar este `CLAUDE.md` y/o `README.md` en cada cambio relevante** —
  funcionalidades nuevas, cambios de arquitectura, nuevos endpoints, cambios en
  CI/CD o variables de entorno. En el mismo commit que el cambio.

## Git — REGLA OBLIGATORIA
- En **cualquier** commit, push, pull, merge o deploy: **NO agregar a Claude como
  co-autor ni como contribuidor.** Prohibido incluir cualquiera de estas líneas
  o similares en mensajes de commit, descripciones de PR o comentarios:
  - `Co-Authored-By: Claude ...`
  - `🤖 Generated with Claude Code`
  - `Generated with ...` / `Assisted by ...`
- Los mensajes de commit van limpios, en español, describiendo solo el cambio.
- No firmar, no añadir trailers, no mencionar la herramienta.

---

## Proyecto

Prueba_GPLANET — aplicación interna de Grupo Planet (prueba técnica).

## Requisitos mínimos
| Herramienta | Versión |
|-------------|---------|
| Python | 3.10 o superior (probado con 3.14) |
| Node.js | 20.19 o superior (probado con 24) |
| npm | 10 o superior (probado con 11) |
| Git | cualquier versión reciente |

Dependencias Python: solo `flask` (ver `requirements.txt`). Frontend: `frontend/package.json`.

## Stack técnico

### Backend — Flask (Python)
- `app.py` — app principal, login automático local, logout, log de errores
- `api_routes.py` — Blueprint Flask en `/api` (health, me, usuarios)
- `database.py` — acceso a SQLite (`demo.db`), tablas `usuarios` y `logs_errores`
- `config.py` — configuración fija local
- Auth por session cookie (Flask session), `_require_login()` / `_require_role()`

### Frontend — Angular 22 SPA
- Standalone components, lazy-loaded routes, signal-based state
- Directorio: `frontend/` · Build output: `frontend/dist/frontend/browser/`
- `services/api.service.ts` — HTTP con `withCredentials: true`
- `services/auth.service.ts` — usuario actual, roles (`isAdmin`, `hasRole`)
- `guards/auth.guard.ts` — `authGuard` (sesión) y `roleGuard(...roles)`

### Secciones de la barra lateral
- **`frontend/src/app/secciones.config.ts` es la única fuente de verdad.** La
  barra lateral (`layout/shell.html`) y el ruteo (`app.routes.ts`) se generan
  desde el arreglo `SECCIONES`. Para agregar una sección, agrega un objeto ahí.
- Cada sección usa por defecto el componente genérico `features/seccion/` (una
  pantalla en blanco). Cuando tenga funcionalidad real, crea su propio
  componente y apúntalo en `app.routes.ts`.
- **Secciones por rol**: agrega `roles: ['admin']` (u otro) a una sección para
  que solo la vean esos roles. Sin `roles`, la ven todos los autenticados.

## Roles
`admin` (gestión total, ve Administración → Usuarios) y `usuario` (acceso
básico). Definidos en `database.ROLES` y `auth.service.rolLabel()`. El correo en
`OWNER_EMAIL` (`.env`) queda como admin permanente. Para agregar un rol nuevo,
edítalo en ambos lugares.

## Reglas de UI — OBLIGATORIAS
- **Modales siempre propios, nunca `confirm()`/`alert()`/`prompt()`.** Patrón
  `modal-backdrop` / `modal-box` (ver `admin/usuarios/usuarios.html`).
- **Íconos de eliminar**: basura SVG, clase `btn-icon-danger`.
- **Protección de usuario actual**: en Usuarios, el usuario logueado no puede
  modificarse ni desactivarse a sí mismo (`esSelf()`).
- Paleta Grupo Planet: `--primary: #212121`, `--accent: #E65100`, `--bg: #F1F1F1`
  (`frontend/src/styles.css`).

## Configuración local
La app **no usa `.env`, Azure ni MariaDB**. Todo está fijo en `config.py`:
login automático con un usuario local (`demo@gplanet.cl`, admin) y base SQLite
(`demo.db`, se crea sola).
