import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../../../core/services/usuario.service';
import { OperationFeedbackService } from '../../../../../shared/services/operation-feedback.service';
import { OperationConfirmService } from '../../../../../shared/services/operation-confirm.service';
import { PerfilService, PerfilAcesso } from '../../../../../core/services/perfil_acesso.service';

@Component({
  selector: 'app-usuario-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-cadastro.component.html',
  styleUrls: ['./usuario-cadastro.component.css'],
})
export class UsuarioCadastroComponent implements OnInit {
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  usuarioEdicao: Partial<Usuario & { perfil: string }> = {};

  searchTerm: string = '';
  perfisDisponiveis: PerfilAcesso[] = [];

  formularioAberto = false;
  mensagem = '';
  tipoMensagem = '';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;

  constructor(
    private usuarioService: UsuarioService,
    private perfilService: PerfilService,
    private cdr: ChangeDetectorRef,
    private operationFeedback: OperationFeedbackService,
    private operationConfirm: OperationConfirmService,
  ) {}

  ngOnInit(): void {
    this.carregarPerfis();
    this.carregarUsuarios();
  }

  carregarPerfis(): void {
    this.perfilService.listarPerfis().subscribe({
      next: (dados: PerfilAcesso[]) => {
        this.perfisDisponiveis = dados;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar perfis', erro);
        this.exibirMensagem('Falha ao carregar os perfis de acesso.', 'erro');
      }
    });
  }

  carregarUsuarios(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.usuarioService.obterTodos().subscribe({
      next: (dados: any[]) => { 
        // Normalização de Dados: Limpamos os dados assim que chegam do backend
        const usuariosNormalizados = dados.map((u: any) => {
          return {
            ...u,
            // Extrai o perfil do array relacional (se existir) para a string simples que o frontend espera
            perfil: u.perfil ? u.perfil : (u.perfis && u.perfis.length > 0 ? u.perfis[0].nome : 'Sem perfil')
          };
        });

        // O cast 'as Usuario[]' acalma o compilador restrito do TypeScript
        this.usuarios = usuariosNormalizados as Usuario[];
        this.usuariosFiltrados = usuariosNormalizados as Usuario[];
        
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.exibirMensagem('Falha ao carregar a lista de usuários.', 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSearchChange(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(
        (u: any) => {
          // Graças à normalização, basta ler a propriedade u.perfil diretamente
          const nomePerfil = u.perfil || '';
          
          return u.nome?.toLowerCase().includes(termo) ||
                 u.login_usuario?.toLowerCase().includes(termo) ||
                 nomePerfil.toLowerCase().includes(termo);
        }
      );
    }
    this.cdr.detectChanges();
  }

  abrirFormulario(usuario?: any): void {
    if (usuario) {
      // Como o carregarUsuarios já extraiu o perfil corretamente, copiamos o objeto de forma direta
      this.usuarioEdicao = { ...usuario, senha_hash: '' };
    } else {
      this.usuarioEdicao = { ativo: true, perfil: '' };
    }
    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.usuarioEdicao = {};
  }

  salvar(): void {
    if (
      !this.usuarioEdicao.nome ||
      !this.usuarioEdicao.login_usuario ||
      !this.usuarioEdicao.perfil
    ) {
      this.exibirMensagem('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    this.carregandoSalvar = true;

    if (this.usuarioEdicao.id) {
      this.usuarioService
        .atualizar(this.usuarioEdicao.id, this.usuarioEdicao as Usuario)
        .subscribe({
          next: () => {
            this.exibirMensagem('Usuário atualizado com sucesso.', 'sucesso', () => {
              this.fecharFormulario();
              this.carregarUsuarios();
            });
            this.carregandoSalvar = false;
          },
          error: (erro: any) => {
            this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
            this.carregandoSalvar = false;
            this.cdr.detectChanges();
          },
        });
    } else {
      if (!this.usuarioEdicao.senha_hash) {
        this.exibirMensagem('A senha é obrigatória para novos usuários.', 'erro');
        this.carregandoSalvar = false;
        return;
      }

      this.usuarioService.criar(this.usuarioEdicao as Usuario).subscribe({
        next: () => {
          this.exibirMensagem('Usuário cadastrado com sucesso.', 'sucesso', () => {
            this.fecharFormulario();
            this.carregarUsuarios();
          });
          this.carregandoSalvar = false;
        },
        error: (erro: any) => {
          this.exibirMensagem('Erro ao salvar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  async deletar(alvo: any): Promise<void> {
    const idParaDeletar = typeof alvo === 'number' ? alvo : alvo?.id || alvo?.id_usuario;

    if (!idParaDeletar) {
      this.exibirMensagem('Erro: Não foi possível identificar o ID do usuário.', 'erro');
      console.error('Payload recebido no botão deletar:', alvo);
      return;
    }

    const nomeUsuario = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este usuário';

    const confirmacao = await this.operationConfirm.confirm({
      title: 'Excluir usuário',
      message: `Tem certeza que deseja excluir ${nomeUsuario}? Esta ação não poderá ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Voltar',
    });
    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.usuarioService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarUsuarios();
        this.carregandoDeletar = false;
        this.exibirMensagem('Usuário excluído com sucesso.', 'sucesso');
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir usuário.', 'erro');
        this.carregandoDeletar = false;
        this.cdr.detectChanges();
      },
    });
  }

  exibirMensagem(msg: string, tipo: 'sucesso' | 'erro', onClose?: () => void): void {
    this.operationFeedback.show(msg, tipo, 1000);

    if (onClose) {
      setTimeout(() => {
        onClose();
        this.cdr.detectChanges();
      }, 1000);
    }
  }
}