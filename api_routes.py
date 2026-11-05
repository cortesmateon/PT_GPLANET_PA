from flask import Blueprint, request, jsonify, session
import config
import database as db

api = Blueprint("api", __name__, url_prefix="/api")


# ── Auth helpers ─────────────────────────────────────────────────────────────

def _require_login():
    if "user" not in session:
        return jsonify({"error": "No autorizado"}), 401
    return None

def _require_role(*roles):
    err = _require_login()
    if err:
        return err
    if session["user"].get("rol") not in roles:
        return jsonify({"error": "Sin permisos"}), 403
    return None

def _rows_to_list(rows):
    return [dict(r) for r in rows] if rows else []


# ── Health check (sin autenticación) ─────────────────────────────────────────

@api.route("/health")
def health():
    try:
        db.health_check()
        return jsonify({"status": "ok", "db": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "db": str(e)}), 500


# ── Sesión ───────────────────────────────────────────────────────────────────

@api.route("/me")
def me():
    if "user" not in session:
        return jsonify({"error": "No autorizado"}), 401
    return jsonify(session["user"])


# ── Usuarios (admin) ─────────────────────────────────────────────────────────

@api.route("/usuarios", methods=["GET"])
def get_usuarios():
    err = _require_role("admin")
    if err:
        return err
    return jsonify({
        "usuarios":    _rows_to_list(db.get_all_usuarios()),
        "roles":       db.ROLES,
        "owner_email": config.OWNER_EMAIL,
    })


@api.route("/usuarios", methods=["POST"])
def create_usuario():
    err = _require_role("admin")
    if err:
        return err
    data = request.get_json() or {}
    nombre = (data.get("nombre") or "").strip()
    email  = (data.get("email") or "").strip().lower()
    rol    = data.get("rol", "usuario")
    if not nombre or not email:
        return jsonify({"error": "Nombre y correo son obligatorios."}), 400
    if rol not in db.ROLES:
        rol = "usuario"
    _, err_msg = db.create_usuario_manual(nombre, email, rol)
    if err_msg:
        return jsonify({"error": err_msg}), 409
    return jsonify({"ok": True, "message": f"Usuario {nombre} agregado correctamente."})


@api.route("/usuarios/<int:id>/rol", methods=["PUT"])
def cambiar_rol(id):
    err = _require_role("admin")
    if err:
        return err
    data = request.get_json() or {}
    rol     = data.get("rol")
    usuario = db.get_usuario(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    if usuario["email"].lower() == config.OWNER_EMAIL:
        return jsonify({"error": "Este usuario es administrador permanente y no puede modificarse."}), 403
    if rol not in db.ROLES:
        return jsonify({"error": "Rol inválido."}), 400
    if rol != "admin" and usuario["rol"] == "admin" and db.count_active_admins() <= 1:
        return jsonify({"error": "Debe existir al menos un administrador activo."}), 409
    db.update_usuario_rol(id, rol)
    return jsonify({"ok": True, "message": "Rol actualizado."})


@api.route("/usuarios/<int:id>/toggle", methods=["PUT"])
def toggle_usuario(id):
    err = _require_role("admin")
    if err:
        return err
    usuario = db.get_usuario(id)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404
    if usuario["email"].lower() == config.OWNER_EMAIL:
        return jsonify({"error": "Este usuario es administrador permanente y no puede modificarse."}), 403
    if usuario["activo"] and usuario["rol"] == "admin" and db.count_active_admins() <= 1:
        return jsonify({"error": "Debe existir al menos un administrador activo."}), 409
    db.toggle_usuario_activo(id)
    return jsonify({"ok": True, "message": "Estado actualizado."})


# ── Log de errores (admin) ────────────────────────────────────────────────────
# Vista simple del log de errores de esta app. Los 3 aplicativos base de Grupo
# Planet comparten este esquema; si más adelante quieres una vista unificada
# cross-app, replica el patrón de PortalGplanet (lectura cross-DB).

@api.route("/logs-errores")
def get_logs_errores():
    err = _require_role("admin")
    if err:
        return err
    fecha_desde = request.args.get("fecha_desde") or None
    fecha_hasta = request.args.get("fecha_hasta") or None
    usuario     = request.args.get("usuario") or None
    page        = max(1, request.args.get("page", 1, type=int))
    page_size   = request.args.get("page_size", 25, type=int)

    items = _rows_to_list(db.get_logs_errores(fecha_desde=fecha_desde, fecha_hasta=fecha_hasta, usuario=usuario))
    total = len(items)
    start = (page - 1) * page_size
    return jsonify({"items": items[start:start + page_size], "total": total})
