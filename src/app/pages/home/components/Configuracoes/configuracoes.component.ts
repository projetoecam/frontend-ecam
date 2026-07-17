import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // Adicionado ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerfilService, PerfilAcesso } from '../../../../core/services/perfil_acesso.service';
import { OperationFeedbackService } from '../../../../shared/services/operation-feedback.service';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracoes.component.html'
})
export class ConfiguracoesComponent implements OnInit {
  perfis: PerfilAcesso[] = [];
  perfilSelecionado: PerfilAcesso | null = null;
  todasPermissoes: any[] = []; 
  
  carregando = false;

  constructor(
    private perfilService: PerfilService,
    private feedback: OperationFeedbackService,
    private cdr: ChangeDetectorRef // Injetado
  ) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  carregarDadosIniciais(): void {
    this.carregando = true;
    
    this.perfilService.listarPerfis().subscribe({
      next: (dados) => {
        console.log('Perfis recebidos:', dados); // Depuração
        this.perfis = dados;
        this.cdr.detectChanges(); // FORÇA o Angular a desenhar os perfis na tela
        this.carregando = false;
      },
      error: (err) => {
        console.error('Erro ao carregar perfis', err);
        this.carregando = false;
      }
    });

    this.perfilService.listarTodasPermissoes().subscribe(p => {
        this.todasPermissoes = p;
        this.cdr.detectChanges(); // FORÇA o Angular a desenhar as permissões
    });
  }

  selecionarPerfil(perfil: PerfilAcesso): void {
    this.perfilSelecionado = perfil;
    this.cdr.detectChanges();
  }

  temPermissao(permissaoNome: string): boolean {
    if (!this.perfilSelecionado || !this.perfilSelecionado.permissoes) return false;
    return this.perfilSelecionado.permissoes.some(p => p.nome === permissaoNome);
  }

  togglePermissao(permissao: any, event: any): void {
    if (!this.perfilSelecionado) return;
    const isChecked = event.target.checked;
    this.feedback.show(`Permissão ${permissao.nome} ${isChecked ? 'adicionada' : 'removida'}!`, 'sucesso', 1000);
  }
}