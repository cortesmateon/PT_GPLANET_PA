import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { ShellComponent } from './layout/shell';
import { SECCIONES } from './secciones.config';

// Secciones con componente propio. Las que no estén acá usan el componente
// genérico (SeccionComponent, pantalla en blanco). Al darle funcionalidad real
// a una sección, crea su componente y regístralo en este mapa.
const COMPONENTES_SECCION: Record<string, () => Promise<any>> = {
  'seccion-2': () => import('./features/seccion-2/seccion-2').then(m => m.Seccion2Component),
};

// Rutas de las secciones generadas automáticamente desde secciones.config.ts.
// Reciben titulo/label por `data` (enlazado a los inputs del componente vía
// withComponentInputBinding).
const rutasSecciones: Routes = SECCIONES.map(s => ({
  path: s.path,
  loadComponent:
    COMPONENTES_SECCION[s.path] ??
    (() => import('./features/seccion/seccion').then(m => m.SeccionComponent)),
  data: { titulo: s.titulo, label: s.label },
  ...(s.roles ? { canActivate: [roleGuard(...s.roles)] } : {}),
}));

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      ...rutasSecciones,
      {
        path: 'admin',
        canActivate: [roleGuard('admin')],
        children: [
          {
            path: 'usuarios',
            loadComponent: () => import('./features/admin/usuarios/usuarios').then(m => m.UsuariosComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: 'inicio' }
];
