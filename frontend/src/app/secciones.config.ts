// ══════════════════════════════════════════════════════════════════════════
//  Configuración de secciones de la barra lateral
//  ------------------------------------------------------------------------
//  Este archivo es la ÚNICA fuente de verdad de las secciones: la barra
//  lateral (shell) y el ruteo (app.routes.ts) se generan a partir de este
//  arreglo. Agregar una sección = agregar un objeto acá.
//
//  Campos:
//   - path   : ruta URL (sin "/"), ej. 'seccion-1'
//   - label  : texto que se ve en la barra lateral
//   - titulo : título que se muestra dentro de la pantalla
//   - icon   : el atributo "d" de un <path> SVG (24x24, stroke). Reemplaza el
//              ícono por defecto por el que quieras (ver https://heroicons.com).
//   - roles  : (opcional) roles que pueden ver la sección. Si se omite, la ven
//              todos los usuarios autenticados. Ej: roles: ['admin']
// ══════════════════════════════════════════════════════════════════════════

export interface Seccion {
  path: string;
  label: string;
  titulo: string;
  icon: string;
  roles?: string[];
}

// Ícono genérico por defecto (cuadrícula). Cambiar por sección según se quiera.
const ICONO_DEFAULT =
  'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';

export const SECCIONES: Seccion[] = [
  { path: 'seccion-1', label: 'Sección 1', titulo: 'Sección 1', icon: ICONO_DEFAULT },
];
