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
  
  // DADOS ESTRATÉGICOS FICTÍCIOS PARA IMPRESSIONAR O CLIENTE
  dashboard = {
    // Top Métricas
    kpis: {
      totalBase: '12.450',
      liderancasAtivas: '342',
      taxaResolucao: '78%',
      alertasPendentes: '14'
    },
    
    // 1. Ranking de Força (Termômetro)
    rankingLiderancas: [
      { nome: 'Pr. Carlos Silva', territorio: 'Curado', segmento: 'Religioso', base: 345, classe: 'A' },
      { nome: 'Maria de Fátima', territorio: 'Jab. Histórico', segmento: 'Comunitário', base: 210, classe: 'B' },
      { nome: 'Prof. Roberto', territorio: 'Praias', segmento: 'Educação', base: 130, classe: 'C' }
    ],

    // 2. Eficiência de Demandas (Barras de progresso)
    eficienciaDemandas: [
      { categoria: 'Iluminação Pública', recebidas: 145, resolvidas: 115, percentual: 79, cor: 'bg-emerald-500' },
      { categoria: 'Saúde (Marcação)', recebidas: 67, resolvidas: 45, percentual: 67, cor: 'bg-blue-500' },
      { categoria: 'Calçamento', recebidas: 89, resolvidas: 24, percentual: 26, cor: 'bg-amber-500' }
    ],

    // 3. Radar de Alertas (Gestão de Crise)
    alertas: [
      { nome: 'José Alfredo', motivo: 'Demanda parada há 45 dias', status: 'Crítico' },
      { nome: 'Assoc. Muribeca', motivo: 'Liderança sem visita há 30 dias', status: 'Atenção' },
      { nome: 'Lúcia Maria', motivo: 'Aniversariante do dia (Falta ligar)', status: 'Ação Rápida' }
    ],
    
    // 4. Raio-X de Expansão
    expansao: [
      { territorio: 'Praias', status: 'Consolidada', novos: '+215' },
      { territorio: 'Cavaleiro', status: 'Em Expansão', novos: '+305' }
    ]
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
    this.router.navigate(['/home']).then(() => window.location.reload());
  }

  refreshData() {
    this.lastRefresh = new Date();
  }

  abrirMunicipios() { this.cadastroAtivo = 'municipios'; this.isMobileMenuOpen = false; }
  abrirMacroRegioes() { this.cadastroAtivo = 'macro-regioes'; this.isMobileMenuOpen = false; }
  abrirBairros() { this.cadastroAtivo = 'bairros'; this.isMobileMenuOpen = false; }
  abrirComunidades() { this.cadastroAtivo = 'comunidades'; this.isMobileMenuOpen = false; }
  abrirUsuarios() { this.cadastroAtivo = 'usuarios'; this.isMobileMenuOpen = false; }

  voltarDashboard() {
    this.cadastroAtivo = null;
  }
}