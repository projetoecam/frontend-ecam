import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BairroCadastroComponent } from './components/bairro-cadastro.component';
import { MunicipioCadastroComponent } from './components/municipio-cadastro.component';
import { MacroRegiaoCadastroComponent } from './components/macro-regiao-cadastro.component';
import { ComunidadeCadastroComponent } from './components/comunidade-cadastro.component';
import { UsuarioCadastroComponent } from './components/usuario-cadastro.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    BairroCadastroComponent, 
    MunicipioCadastroComponent, 
    MacroRegiaoCadastroComponent, 
    ComunidadeCadastroComponent, 
    UsuarioCadastroComponent
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  usuario = localStorage.getItem('usuario') ?? '';
  lastRefresh = new Date();
  
  isCadastrosOpen = true;
  isMobileMenuOpen = false;
  isDesktopMenuOpen = true; 
  cadastroAtivo: string | null = null;
  
  dashboard = {
    totalUsers: 1240,
    openReports: 18,
    monthlyRevenue: 'R$ 76.300',
    systemHealth: 'Excelente'
  };
  
  cadastrosOptions = ['Usuários', 'Municipios', 'Macro Região', 'Comunidade', 'Bairro'];

  constructor(private router: Router) {}

  get usuarioInicial() {
    return this.usuario ? this.usuario[0].toUpperCase() : 'U';
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleDesktopMenu() {
    this.isDesktopMenuOpen = !this.isDesktopMenuOpen;
  }

  goHome() {
    this.isMobileMenuOpen = false; 
    this.router.navigate(['/home']).then(() => {
      window.location.reload();
    });
  }

  refreshData() {
    this.lastRefresh = new Date();
    this.dashboard.openReports += 1;
    this.dashboard.totalUsers += 2;
  }

  abrirMunicipios() {
    this.cadastroAtivo = 'municipios';
    this.isMobileMenuOpen = false; 
  }

  abrirMacroRegioes() {
    this.cadastroAtivo = 'macro-regioes';
    this.isMobileMenuOpen = false; 
  }

  abrirBairros() {
    this.cadastroAtivo = 'bairros';
    this.isMobileMenuOpen = false; 
  }

  abrirComunidades() {
    this.cadastroAtivo = 'comunidades';
    this.isMobileMenuOpen = false; 
  }

  abrirUsuarios() {
    this.cadastroAtivo = 'usuarios';
    this.isMobileMenuOpen = false; 
  }

  voltarDashboard() {
    this.cadastroAtivo = null;
  }
}