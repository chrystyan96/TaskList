import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent }

  // Exemplo de Lazy Loading (carregamento sob demanda): 
  // {
  //   path: 'busca',
  //   loadComponent: () => import('./pages/busca/busca.component').then(m => m.BuscaComponent)
  // },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
