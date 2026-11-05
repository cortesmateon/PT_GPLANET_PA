import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente propio de la Sección 2.
 *
 * Recibe `titulo` y `label` desde la `data` de la ruta (ver app.routes.ts),
 * enlazados automáticamente por withComponentInputBinding(). El texto de la
 * barra lateral y la tarjeta de /inicio salen de secciones.config.ts.
 */
@Component({
  selector: 'app-seccion-2',
  imports: [CommonModule],
  templateUrl: './seccion-2.html'
})
export class Seccion2Component {
  titulo = input('Sección 2');
  label = input('');
}
