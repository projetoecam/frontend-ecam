import { Component, OnInit } from '@angular/core';
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
  
  // Variáveis de controle de dados
  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = []; // Esta variável é a que o HTML usa para desenhar
  usuarioSelecionado: Usuario | null = null;
  usuarioEdicao: Partial<Usuario> = {};

  searchTerm: string = '';
  perfisDisponiveis: string[] = ['ADMIN', 'COORDENADOR', 'OPERADOR'];

  // Variáveis de controle de tela
  modalSucessoAberto = false;
  formularioAberto = false;
  mensagem = '';
  tipoMensagem = '';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  carregarUsuarios(): void {
    this.carregandoLista = true;
    this.usuarioService.obterTodos().subscribe({
      next: (dados) => {
        this.usuarios = dados;
        this.usuariosFiltrados = dados; // O SEGREDO ESTAVA AQUI: Alimentar o filtro!
        this.carregandoLista = false;
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de usuários do backend.', 'erro');
        this.carregandoLista = false;
      }
    });
  }

  onSearchChange(): void {
    const termo = this.searchTerm.toLowerCase().trim();
    if (!termo) {
      this.usuariosFiltrados = this.usuarios;
    } else {
      this.usuariosFiltrados = this.usuarios.filter(u =>
        (u.nome?.toLowerCase().includes(termo)) ||
        (u.login_usuario?.toLowerCase().includes(termo)) ||
        (u.perfil?.toLowerCase().includes(termo))
      );
    }
  }

  abrirFormulario(usuario?: Usuario): void {
    this.formularioAberto = true;
    if (usuario) {
      this.usuarioEdicao = { ...usuario };
    } else {
      this.usuarioEdicao = { ativo: true, perfil: '' }; // Valores default no novo
    }
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.usuarioEdicao = {};
  }

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
  }

  salvar(): void {
    this.carregandoSalvar = true;
    
    if (this.usuarioEdicao.id) {
      // Editar (Caso futuramente implemente edição de usuário)
      this.carregandoSalvar = false;
    } else {
      // Criar novo usuário via endpoint registrar
      this.usuarioService.criar(this.usuarioEdicao as Usuario).subscribe({
        next: () => {
          this.modalSucessoAberto = true;
          setTimeout(() => this.modalSucessoAberto = false, 3000);
          this.fecharFormulario();
          this.carregarUsuarios(); // Atualiza a lista na tela imediatamente
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao salvar o usuário. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
        }
      });
    }
  }

  deletar(id?: number): void {
    if (!id) return;
    this.carregandoDeletar = true;
    this.usuarioService.deletar(id).subscribe({
      next: () => {
        this.carregarUsuarios();
        this.carregandoDeletar = false;
      },
      error: () => {
        this.exibirMensagem('Erro ao deletar o usuário.', 'erro');
        this.carregandoDeletar = false;
      }
    });
  }

  exibirMensagem(msg: string, tipo: string) {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    setTimeout(() => this.mensagem = '', 4000);
  }
}