import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { OperationToastComponent } from '../../shared/components/operation-toast/operation-toast.component';
import { OperationConfirmComponent } from '../../shared/components/operation-confirm/operation-confirm.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    OperationToastComponent,
    OperationConfirmComponent,
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {
  usuario = localStorage.getItem('usuario') ?? '';
  lastRefresh = new Date();
  
  isCadastrosOpen = true;
  isMobileMenuOpen = false;
  isDesktopMenuOpen = true;
  isModalDesenvolvimentoOpen: boolean = false;

  
  dashboard = {
    
    kpis: {
      totalBase: '12.450',
      liderancasAtivas: '342',
      taxaResolucao: '78%',
      alertasPendentes: '14'
    },
    
    
    rankingLiderancas: [
      { nome: 'Pr. Carlos Silva', territorio: 'Curado', segmento: 'Religioso', base: 345, classe: 'A' },
      { nome: 'Maria de Fátima', territorio: 'Jab. Histórico', segmento: 'Comunitário', base: 210, classe: 'B' },
      { nome: 'Prof. Roberto', territorio: 'Praias', segmento: 'Educação', base: 130, classe: 'C' }
    ],

    
    eficienciaDemandas: [
      { categoria: 'Iluminação Pública', recebidas: 145, resolvidas: 115, percentual: 79, cor: 'bg-emerald-500' },
      { categoria: 'Saúde (Marcação)', recebidas: 67, resolvidas: 45, percentual: 67, cor: 'bg-blue-500' },
      { categoria: 'Calçamento', recebidas: 89, resolvidas: 24, percentual: 26, cor: 'bg-amber-500' }
    ],

    
    alertas: [
      { nome: 'José Alfredo', motivo: 'Demanda parada há 45 dias', status: 'Crítico' },
      { nome: 'Assoc. Muribeca', motivo: 'Liderança sem visita há 30 dias', status: 'Atenção' },
      { nome: 'Lúcia Maria', motivo: 'Aniversariante do dia (Falta ligar)', status: 'Ação Rápida' }
    ],
    
    
    expansao: [
      { territorio: 'Praias', status: 'Consolidada', novos: '+215' },
      { territorio: 'Cavaleiro', status: 'Em Expansão', novos: '+305' }
    ]
  };
  
  cadastrosOptions = ['Usuários', 'Municipios', 'Macro Região', 'Comunidade', 'Bairro'];

  constructor(private router: Router) {}

  get isDashboardRoute(): boolean {
    return this.router.url === '/home' || this.router.url === '/home/';
  }

  get usuarioInicial() {
    return this.usuario ? this.usuario[0].toUpperCase() : 'U';
  }

  isActiveRoute(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
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
    this.navegarPara('/home');
  }

  refreshData() {
    this.lastRefresh = new Date();
  }

  abrirMunicipios() { this.navegarPara('/home/cadastro/municipios'); }
  abrirMacroRegioes() { this.navegarPara('/home/cadastro/macro-regioes'); }
  abrirBairros() { this.navegarPara('/home/cadastro/bairros'); }
  abrirComunidades() { this.navegarPara('/home/cadastro/comunidades'); }
  abrirUsuarios() { this.navegarPara('/home/cadastro/usuarios'); }
  abrirPessoas() { this.navegarPara('/home/cadastro/pessoas'); }
  abrirSegmentos() { this.navegarPara('/home/cadastro/segmentos'); }
  abrirLiderancas() { this.navegarPara('/home/cadastro/liderancas'); }
  abrirOperacoes() { this.navegarPara('/home/operacoes'); }

  voltarDashboard() {
    this.navegarPara('/home');
  }

  private navegarPara(path: string): void {
    this.isMobileMenuOpen = false;
    this.router.navigateByUrl(path);
  }

  mostrarMensagemDesenvolvimento(): void {
    this.isModalDesenvolvimentoOpen = true;
  }

  fecharModalDesenvolvimento(): void {
    this.isModalDesenvolvimentoOpen = false;
  }
}
