import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MunicipioCadastroComponent } from './components/municipio-cadastro.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MunicipioCadastroComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  usuario = localStorage.getItem('usuario') ?? '';
  lastRefresh = new Date();
  isCadastrosOpen = true;
  isMobileMenuOpen = false;
  cadastroAtivo: string | null = null;
  dashboard = {
    totalUsers: 1240,
    openReports: 18,
    monthlyRevenue: 'R$ 76.300',
    systemHealth: 'Excelente'
  };
  cadastrosOptions = ['Usuários', 'Municipios', 'Produtos', 'Fornecedores'];

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

  goHome() {
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
  }

  voltarDashboard() {
    this.cadastroAtivo = null;
  }
}
