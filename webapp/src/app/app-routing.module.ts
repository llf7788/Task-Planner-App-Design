import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginComponent} from './views/login/login.component';
import {RegComponent} from './views/reg/reg.component';
import {IndexComponent} from './views/index/index.component';

// route link
const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'reg', component: RegComponent},
  {path: '', component: IndexComponent},

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
