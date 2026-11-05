# Configuración local fija: la app NO depende de .env, Azure ni MariaDB.
# Login automático con un usuario local + base de datos SQLite (archivo local).

SECRET_KEY = "prueba-tecnica-clave-local"

# Archivo SQLite (se crea solo al primer arranque).
DB_PATH = "demo.db"

# Angular dev server (npm start). Destino del redirect post-login.
import os
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:4200")

# Admin permanente (no se puede degradar/desactivar).
OWNER_EMAIL = "demo@gplanet.cl"

# Usuario con el que se inicia sesión automáticamente.
DEMO_USER = {
    "nombre": "Usuario Demo",
    "email":  OWNER_EMAIL,
    "rol":    "admin",
}
