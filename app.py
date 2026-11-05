import os
import traceback
from flask import Flask, redirect, session, request, jsonify, g
from werkzeug.exceptions import HTTPException
import config
import database as db

app = Flask(__name__)
app.secret_key = config.SECRET_KEY

db.init_db()

from api_routes import api as api_blueprint
app.register_blueprint(api_blueprint)


# ── Log de errores centralizado ─────────────────────────────────────────────
# Captura cualquier excepción no controlada (500 con stacktrace) y las
# respuestas 403/404/500 en la tabla logs_errores, sin tocar cada endpoint.

@app.errorhandler(Exception)
def _log_excepcion(e):
    if isinstance(e, HTTPException):
        return e
    user = session.get("user") or {}
    db.registrar_error_log(user.get("email"), user.get("nombre"),
                            request.method, request.path, 500, str(e), traceback.format_exc())
    g._error_logueado = True
    # En local (debug) deja propagar la excepción para ver el traceback completo
    # en la terminal / el debugger de Flask, en vez del mensaje genérico opaco.
    if app.debug:
        raise e
    return jsonify({"error": "Error interno del servidor"}), 500


@app.after_request
def _log_respuesta_error(response):
    if response.status_code in (403, 404, 500) and not getattr(g, "_error_logueado", False):
        user = session.get("user") or {}
        db.registrar_error_log(user.get("email"), user.get("nombre"),
                                request.method, request.path, response.status_code)
    return response


# ── Auth (login automático local) ─────────────────────────────────────────────

@app.route("/")
def index():
    return redirect(config.FRONTEND_URL if "user" in session else "/login")


@app.route("/login")
def login():
    user_db = db.get_or_create_user(config.DEMO_USER)
    session["user"] = {"nombre": user_db["nombre"], "email": user_db["email"], "rol": user_db["rol"]}
    return redirect(config.FRONTEND_URL)


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")


# ── Run (dev local) ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
