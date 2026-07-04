import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, Usuario } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-usuario-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuario-cadastro.component.html',
  styleUrls: ['./usuario-cadastro.component.css']
})
export class UsuarioCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  formularioAberto = false;
  usuarioEdicao: Usuario = this.criarUsuarioVazio();
  usuarioSelecionado: Usuario | null = null;
  searchTerm = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';
  modalSucessoAberto = false;

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;

  perfisDisponiveis = ['ADMIN', 'GESTOR', 'OPERADOR'];

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.usuarioService.usuarios$.subscribe(usuarios => {
      this.usuarios = usuarios;
      this.filtrar();
    });

    this.carregarUsuarios();
  }

  private criarUsuarioVazio(): Usuario {
    return {
      nome: '',
      login_usuario: '',
      senha_hash: '',
      perfil: '',
      ativo: true,
      data_criacao: this.dataAtualLocal(),
      codigo_sessao: ''
    };
  }

  private dataAtualLocal(): string {
    const agora = new Date();
    const timezoneOffset = agora.getTimezoneOffset() * 60000;
    return new Date(agora.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }

  carregarUsuarios() {
    this.carregandoLista = true;
    this.usuarioService.obterTodos().subscribe(
      usuarios => {
        this.usuarios = usuarios;
        this.filtrar();
        this.carregandoLista = false;
      },
      erro => {
        this.mostrarMensagem('Erro ao carregar usuários: ' + erro.message, 'erro');
        this.carregandoLista = false;
      }
    );
  }

  filtrar() {
    if (!this.searchTerm) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    const termo = this.searchTerm.toLowerCase();
    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.nome.toLowerCase().includes(termo) ||
      u.login_usuario.toLowerCase().includes(termo) ||
      u.perfil.toLowerCase().includes(termo)
    );
  }

  onSearchChange() {
    this.filtrar();
  }

  abrirFormulario(usuario?: Usuario) {
    if (usuario) {
      this.usuarioEdicao = {
        ...usuario,
        data_criacao: this.formatarDataParaInput(usuario.data_criacao)
      };
    } else {
      this.usuarioEdicao = this.criarUsuarioVazio();
    }

    this.formularioAberto = true;
  }

  private formatarDataParaInput(data?: string | Date): string {
    if (!data) {
      return this.dataAtualLocal();
    }

    const dataObj = new Date(data);
    if (Number.isNaN(dataObj.getTime())) {
      return this.dataAtualLocal();
    }

    const timezoneOffset = dataObj.getTimezoneOffset() * 60000;
    return new Date(dataObj.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }

  fecharFormulario() {
    this.formularioAberto = false;
    this.usuarioEdicao = this.criarUsuarioVazio();
  }

  limparFormulario() {
    this.usuarioEdicao = this.criarUsuarioVazio();
  }

  private mostrarSucessoSalvo() {
    this.modalSucessoAberto = true;
    setTimeout(() => {
      this.modalSucessoAberto = false;
    }, 1000);
  }

  private finalizarSalvarComSucesso() {
    this.mostrarSucessoSalvo();
    this.limparFormulario();
    this.formularioAberto = true;
    this.usuarioSelecionado = null;
    this.carregarUsuarios();
  }

  salvar() {
    if (!this.usuarioEdicao.nome || !this.usuarioEdicao.login_usuario || !this.usuarioEdicao.senha_hash || !this.usuarioEdicao.perfil) {
      this.mostrarMensagem('Preencha os campos obrigatórios', 'erro');
      return;
    }

    const nomeNormalizado = this.usuarioEdicao.nome.trim();
    const loginNormalizado = this.usuarioEdicao.login_usuario.trim();
    const senhaNormalizada = this.usuarioEdicao.senha_hash.trim();
    const perfilNormalizado = this.usuarioEdicao.perfil.trim().toUpperCase();

    if (!nomeNormalizado || !loginNormalizado || !senhaNormalizada || !perfilNormalizado) {
      this.mostrarMensagem('Preencha os campos obrigatórios', 'erro');
      return;
    }

    const listaUsuarios = Array.isArray(this.usuarios) ? this.usuarios : [];
    const loginDuplicado = listaUsuarios.some(u =>
      u.id !== this.usuarioEdicao.id &&
      u.login_usuario.trim().toLowerCase() === loginNormalizado.toLowerCase()
    );

    if (loginDuplicado) {
      this.mostrarMensagem('Este login de usuário já está cadastrado', 'erro');
      return;
    }

    const payload: Usuario = {
      ...this.usuarioEdicao,
      nome: nomeNormalizado,
      login_usuario: loginNormalizado,
      senha_hash: senhaNormalizada,
      perfil: perfilNormalizado,
      data_criacao: this.usuarioEdicao.data_criacao ? new Date(this.usuarioEdicao.data_criacao).toISOString() : undefined
    };

    this.carregandoSalvar = true;

    if (payload.id) {
      this.usuarioService.atualizar(payload.id, payload).subscribe(
        () => {
          this.finalizarSalvarComSucesso();
          this.carregandoSalvar = false;
        },
        erro => {
          this.mostrarMensagem('Erro ao atualizar: ' + erro.message, 'erro');
          this.carregandoSalvar = false;
        }
      );
    } else {
      this.usuarioService.criar(payload).subscribe(
        () => {
          this.finalizarSalvarComSucesso();
          this.carregandoSalvar = false;
        },
        erro => {
          this.mostrarMensagem('Erro ao criar: ' + erro.message, 'erro');
          this.carregandoSalvar = false;
        }
      );
    }
  }

  deletar(id?: number) {
    if (!id) {
      return;
    }

    if (!confirm('Deseja realmente deletar este usuário?')) {
      return;
    }

    this.carregandoDeletar = true;
    this.usuarioService.deletar(id).subscribe(
      () => {
        this.mostrarMensagem('Usuário deletado com sucesso', 'sucesso');
        this.carregarUsuarios();
        this.usuarioSelecionado = null;
        this.carregandoDeletar = false;
      },
      erro => {
        this.mostrarMensagem('Erro ao deletar: ' + erro.message, 'erro');
        this.carregandoDeletar = false;
      }
    );
  }

  selecionarUsuario(usuario: Usuario) {
    this.usuarioSelecionado = usuario;
  }

  mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }

  fecharPainel() {
    this.voltar.emit();
  }
}
