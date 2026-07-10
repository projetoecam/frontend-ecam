import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../../../core/services/usuario.service';

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
        this.exibirMensagem('Falha ao carregar a lista de usuÃ¡rios.', 'erro');
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
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    this.carregandoSalvar = true;

    if (this.usuarioEdicao.id) {
      this.usuarioService
        .atualizar(this.usuarioEdicao.id, this.usuarioEdicao as Usuario)
        .subscribe({
          next: () => {
            this.exibirMensagem('UsuÃ¡rio atualizado com sucesso.', 'sucesso');
            this.fecharFormulario();
            this.carregarUsuarios();
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
        this.exibirMensagem('A senha Ã© obrigatÃ³ria para novos usuÃ¡rios.', 'erro');
        this.carregandoSalvar = false;
        return;
      }

      this.usuarioService.criar(this.usuarioEdicao as Usuario).subscribe({
        next: () => {
          this.exibirMensagem('UsuÃ¡rio cadastrado com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarUsuarios();
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
  deletar(alvo: any): void {
    // 1. Descobre de forma inteligente qual Ã© o ID, seja recebendo um nÃºmero solto ou um objeto (verificando 'id' ou 'id_usuario')
    const idParaDeletar = typeof alvo === 'number' ? alvo : alvo?.id || alvo?.id_usuario;

    if (!idParaDeletar) {
      this.exibirMensagem('Erro: NÃ£o foi possÃ­vel identificar o ID do usuÃ¡rio.', 'erro');
      console.error('Payload recebido no botÃ£o deletar:', alvo); // IrÃ¡ printar no F12 para ajudar caso a API esteja sem ID
      return;
    }

    // 2. Tenta pegar o nome se for um objeto, senÃ£o usa um texto genÃ©rico
    const nomeUsuario = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este usuÃ¡rio';

    // 3. Executa a confirmaÃ§Ã£o
    const confirmacao = window.confirm(
      `AtenÃ§Ã£o: Tem certeza que deseja excluir ${nomeUsuario}? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`,
    );
    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges(); // Atualiza a interface visualmente

    // 4. Dispara a deleÃ§Ã£o
    this.usuarioService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarUsuarios();
        this.carregandoDeletar = false;
        this.exibirMensagem('UsuÃ¡rio excluÃ­do com sucesso.', 'sucesso');
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir usuÃ¡rio.', 'erro');
        this.carregandoDeletar = false;
        this.cdr.detectChanges();
      },
    });
  }

  exibirMensagem(msg: string, tipo: string) {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensagem = '';
      this.cdr.detectChanges();
    }, 4000);
  }
}


