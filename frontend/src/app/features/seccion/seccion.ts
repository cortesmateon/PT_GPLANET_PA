import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente genérico de sección en blanco.
 * Recibe `titulo` y `label` desde la `data` de la ruta (ver app.routes.ts),
 * enlazados automáticamente por withComponentInputBinding().
 *
 * Cuando una sección tenga funcionalidad real, crea su propio componente y
 * apúntalo en app.routes.ts en lugar de este genérico.
 */
@Component({
  selector: 'app-seccion',
  imports: [CommonModule],
  templateUrl: './seccion.html'
})
export class SeccionComponent {
  titulo = input('Sección');
  label = input('');
}
