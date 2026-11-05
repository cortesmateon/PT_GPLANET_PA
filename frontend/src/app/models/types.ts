export interface User {
  nombre: string;
  email: string;
  rol: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_registro?: string;
  ultimo_login?: string | null;
}

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje?: string | null;
  leida: boolean;
  link?: string | null;
  fecha_creacion: string;
}

export interface LogError {
  id: number;
  usuario_email: string | null;
  usuario_nombre: string | null;
  metodo: string;
  ruta: string;
  codigo_http: number;
  mensaje: string | null;
  stacktrace: string | null;
  fecha: string;
}
