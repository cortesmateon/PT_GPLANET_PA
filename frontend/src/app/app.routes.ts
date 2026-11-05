import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';
import { ShellComponent } from './layout/shell';
import { SECCIONES } from './secciones.config';

// Rutas de las secciones generadas automáticamente desde secciones.config.ts.
// Todas usan el mismo componente genérico (SeccionComponent), que recibe
// titulo/label por `data` (enlazado a los inputs vía withComponentInputBinding).
const rutasSecciones: Routes = SECCIONES.map(s => ({
  path: s.path,
  loadComponent: () => import('./features/seccion/seccion').then(m => m.SeccionComponent),
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
