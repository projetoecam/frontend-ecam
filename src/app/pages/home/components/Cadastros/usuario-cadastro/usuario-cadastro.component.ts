import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../../../core/services/usuario.service';
import { OperationFeedbackService } from '../../../../../shared/services/operation-feedback.service';
import { OperationConfirmService } from '../../../../../shared/services/operation-confirm.service';

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
  usuarioEdicao: Partial<Usuario> = {};

  searchTerm: string = '';
  perfisDisponiveis: string[] = ['ADMIN', 'COORDENADOR', 'OPERADOR'];

  formularioAberto = false;
  mensagem = '';
  tipoMensagem = '';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;

  constructor(
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
    private operationFeedback: OperationFeedbackService,
    private operationConfirm: OperationConfirmService,
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.usuarioService.obterTodos().subscribe({
      next: (dados) => {
        this.usuarios = dados;
        this.usuariosFiltrados = dados;
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
        (u) =>
          u.nome?.toLowerCase().includes(termo) ||
          u.login_usuario?.toLowerCase().includes(termo) ||
          u.perfil?.toLowerCase().includes(termo),
      );
    }
    this.cdr.detectChanges();
  }

  abrirFormulario(usuario?: Usuario): void {
    if (usuario) {
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
          error: (erro) => {
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
        error: (erro) => {
          this.exibirMensagem('Erro ao salvar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    }
  }
  async deletar(alvo: any): Promise<void> {
    // 1. Descobre de forma inteligente qual é o ID, seja recebendo um número solto ou um objeto (verificando 'id' ou 'id_usuario')
    const idParaDeletar = typeof alvo === 'number' ? alvo : alvo?.id || alvo?.id_usuario;

    if (!idParaDeletar) {
      this.exibirMensagem('Erro: Não foi possível identificar o ID do usuário.', 'erro');
      console.error('Payload recebido no botão deletar:', alvo); // Irá printar no F12 para ajudar caso a API esteja sem ID
      return;
    }

    // 2. Tenta pegar o nome se for um objeto, senão usa um texto genérico
    const nomeUsuario = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este usuário';

    // 3. Executa a confirmação
    const confirmacao = await this.operationConfirm.confirm({
      title: 'Excluir usuário',
      message: `Tem certeza que deseja excluir ${nomeUsuario}? Esta ação não poderá ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Voltar',
    });
    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges(); // Atualiza a interface visualmente

    // 4. Dispara a deleção
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



