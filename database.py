from datetime import date
import config

# ── Roles ────────────────────────────────────────────────────────────────────
# Estándar de Grupo Planet: rol 'admin' (gestión total) y 'usuario' (acceso
# básico). Para agregar más roles (ej. 'aprobador'), añádelos acá y ajusta la
# lógica de visibilidad en el frontend (shell + secciones.config.ts) y los
# _require_role del backend.
ROLES = {
    "admin":   "Administrador",
    "usuario": "Usuario",
}

import sqlite3


# ── Conexión (SQLite local) ────────────────────────────────────────────────

def _dict_factory(cursor, row):
    return {col[0]: row[idx] for idx, col in enumerate(cursor.description)}

def _conn():
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = _dict_factory
    conn.isolation_level = None  # autocommit
    return conn

def _prep(sql):
    """El SQL se escribe con %s y NOW(); se traduce al dialecto SQLite."""
    return sql.replace("%s", "?").replace("NOW()", "CURRENT_TIMESTAMP")

def _q(sql, params=()):
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(_prep(sql), params)
        rows = cur.fetchall()
        cur.close()
        return rows
    finally:
        conn.close()

def _q1(sql, params=()):
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(_prep(sql), params)
        row = cur.fetchone()
        cur.close()
        return row
    finally:
        conn.close()

def _w(sql, params=()):
    conn = _conn()
    try:
        cur = conn.cursor()
        cur.execute(_prep(sql), params)
        last = cur.lastrowid
        cur.close()
        return last
    finally:
        conn.close()

def health_check():
    _q1("SELECT 1")

# ── Inicialización ─────────────────────────────────────────────────────────

def init_db():
    _init_db_sqlite()
    _seed_demo()


def _init_db_sqlite():
    _w("""
        CREATE TABLE IF NOT EXISTS usuarios (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre         TEXT,
            email          TEXT UNIQUE NOT NULL,
            rol            TEXT DEFAULT 'usuario',
            activo         INTEGER DEFAULT 1,
            fecha_registro TEXT,
            ultimo_login   TEXT
        )
    """)
    _w("""
        CREATE TABLE IF NOT EXISTS logs_errores (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_email  TEXT,
            usuario_nombre TEXT,
            metodo         TEXT,
            ruta           TEXT,
            codigo_http    INTEGER NOT NULL,
            mensaje        TEXT,
            stacktrace     TEXT,
            fecha          TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)


def _seed_demo():
    """Siembra solo el usuario local (admin), si la tabla está vacía."""
    if _q1("SELECT COUNT(*) AS n FROM usuarios")["n"] > 0:
        return
    d = config.DEMO_USER
    _w("INSERT INTO usuarios (nombre,email,rol,activo,fecha_registro,ultimo_login) VALUES (%s,%s,%s,1,%s,NOW())",
       (d["nombre"], d["email"], d["rol"], str(date.today())))


# ── Log de errores ───────────────────────────────────────────────────────────

LOGS_ERRORES_TOPE = 2000

def registrar_error_log(usuario_email, usuario_nombre, metodo, ruta, codigo_http, mensaje=None, stacktrace=None):
    try:
        _w("""
            INSERT INTO logs_errores (usuario_email, usuario_nombre, metodo, ruta, codigo_http, mensaje, stacktrace)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
        """, (usuario_email, usuario_nombre, metodo, ruta, codigo_http, mensaje, stacktrace))
    except Exception:
        pass  # nunca debe tumbar la respuesta de error que se devuelve al usuario

def get_logs_errores(fecha_desde=None, fecha_hasta=None, usuario=None):
    where, params = [], []
    if fecha_desde:
        where.append("fecha >= %s"); params.append(fecha_desde)
    if fecha_hasta:
        where.append("fecha <= %s"); params.append(fecha_hasta + " 23:59:59")
    if usuario:
        where.append("(usuario_email LIKE %s OR usuario_nombre LIKE %s)")
        params += [f"%{usuario}%", f"%{usuario}%"]
    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    return _q(f"""
        SELECT * FROM logs_errores {where_sql}
        ORDER BY fecha DESC LIMIT {LOGS_ERRORES_TOPE}
    """, params)


# ── Usuarios ─────────────────────────────────────────────────────────────────

def get_all_usuarios():
    return _q("SELECT * FROM usuarios ORDER BY nombre")

def get_usuario(id):
    return _q1("SELECT * FROM usuarios WHERE id=%s", (id,))

def get_usuario_by_email(email):
    return _q1("SELECT * FROM usuarios WHERE email=%s", (email.lower(),))

def count_active_admins():
    return _q1("SELECT COUNT(*) AS n FROM usuarios WHERE rol='admin' AND activo=1")["n"]

def get_or_create_user(user_info):
    """Login: crea el usuario si es nuevo, actualiza nombre/ultimo_login si ya
    existe. El primer usuario del sistema (o el OWNER_EMAIL) queda admin
    permanente."""
    email = user_info["email"].lower()
    nombre = user_info["nombre"]
    user = _q1("SELECT * FROM usuarios WHERE email=%s", (email,))
    if user:
        if email == config.OWNER_EMAIL and user["rol"] != "admin":
            _w("UPDATE usuarios SET nombre=%s, rol='admin', activo=1, ultimo_login=NOW() WHERE email=%s",
               (nombre, email))
        else:
            _w("UPDATE usuarios SET nombre=%s, ultimo_login=NOW() WHERE email=%s",
               (nombre, email))
        return _q1("SELECT * FROM usuarios WHERE email=%s", (email,))

    total = _q1("SELECT COUNT(*) AS n FROM usuarios")["n"]
    rol = "admin" if (total == 0 or email == config.OWNER_EMAIL) else "usuario"
    _w("INSERT INTO usuarios (nombre,email,rol,activo,fecha_registro,ultimo_login) VALUES (%s,%s,%s,1,%s,NOW())",
       (nombre, email, rol, str(date.today())))
    return _q1("SELECT * FROM usuarios WHERE email=%s", (email,))

def create_usuario_manual(nombre, email, rol):
    email = email.lower()
    if _q1("SELECT id FROM usuarios WHERE email=%s", (email,)):
        return None, "Ya existe un usuario con ese correo."
    usuario_id = _w("INSERT INTO usuarios (nombre,email,rol,activo,fecha_registro) VALUES (%s,%s,%s,1,%s)",
                     (nombre, email, rol, str(date.today())))
    return usuario_id, None

def update_usuario_rol(id, rol):
    _w("UPDATE usuarios SET rol=%s WHERE id=%s", (rol, id))

def toggle_usuario_activo(id):
    _w("UPDATE usuarios SET activo = NOT activo WHERE id=%s", (id,))
