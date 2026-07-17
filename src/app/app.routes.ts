import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { UsuarioCadastroComponent } from './pages/home/components/Cadastros/usuario-cadastro/usuario-cadastro.component';
import { MunicipioCadastroComponent } from './pages/home/components/Cadastros/municipio-cadastro/municipio-cadastro.component';
import { MacroRegiaoCadastroComponent } from './pages/home/components/Cadastros/macro-regiao-cadastro/macro-regiao-cadastro.component';
import { BairroCadastroComponent } from './pages/home/components/Cadastros/bairro-cadastro/bairro-cadastro.component';
import { ComunidadeCadastroComponent } from './pages/home/components/Cadastros/comunidade-cadastro/comunidade-cadastro.component';
import { PessoaCadastroComponent } from './pages/home/components/Cadastros/pessoa-cadastro/pessoa-cadastro.component';
import { SegmentoCadastroComponent } from './pages/home/components/Cadastros/segmento-cadastro/segmento-cadastro.component';
import { LiderancaCadastroComponent } from './pages/home/components/Cadastros/lideranca-cadastro/lideranca-cadastro.component';
import { FichaCadastroComponent } from './pages/home/components/Operacao/ficha-cadastro/ficha-cadastro.component';
import { ConfiguracoesComponent } from './pages/home/components/Configuracoes/configuracoes.component';
export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    children: [
      { path: 'cadastro/usuarios', component: UsuarioCadastroComponent },
      { path: 'cadastro/municipios', component: MunicipioCadastroComponent },
      { path: 'cadastro/macro-regioes', component: MacroRegiaoCadastroComponent },
      { path: 'cadastro/bairros', component: BairroCadastroComponent },
      { path: 'cadastro/comunidades', component: ComunidadeCadastroComponent },
      { path: 'cadastro/pessoas', component: PessoaCadastroComponent },
      { path: 'cadastro/segmentos', component: SegmentoCadastroComponent },
      { path: 'cadastro/liderancas', component: LiderancaCadastroComponent },
      { path: 'operacoes', component: FichaCadastroComponent },
      { path: 'configuracoes', component: ConfiguracoesComponent}
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];