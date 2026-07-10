import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FichaService, Pessoa } from '../../../../../core/services/ficha.service';
import { Comunidade, ComunidadeService } from '../../../../../core/services/comunidade.service';
import { Usuario, UsuarioService } from '../../../../../core/services/usuario.service';

@Component({
  selector: 'app-pessoa-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pessoa-cadastro.component.html',
  styleUrls: ['./pessoa-cadastro.component.css'],
})
export class PessoaCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  pessoas: Pessoa[] = [];
  pessoasFiltradas: Pessoa[] = [];
  comunidades: Comunidade[] = [];
  usuarios: Usuario[] = [];

  formularioAberto = false;
  pessoaEdicao: Partial<Pessoa> = {};

  comunidadeSelecionadaId: number | '' = '';
  usuarioCadastroSelecionadoId: number | '' = '';
  liderResponsavelSelecionadoId: number | '' = '';
  liderRegionalSelecionadoId: number | '' = '';

  searchTerm = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  carregandoComunidades = false;
  carregandoUsuarios = false;

  statusDisponiveis = ['ATIVO', 'INATIVO', 'PENDENTE'];
  origensCadastro = ['MUTIRAO', 'VISITA', 'INDICACAO', 'ONLINE', 'OUTRO'];

  constructor(
    private fichaService: FichaService,
    private comunidadeService: ComunidadeService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarComunidades();
    this.carregarUsuarios();
    this.carregarPessoas();
  }

  carregarComunidades(): void {
    this.carregandoComunidades = true;
    this.cdr.detectChanges();

    this.comunidadeService.obterTodos().subscribe({
      next: (comunidades) => {
        this.comunidades = comunidades;
        this.carregandoComunidades = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de comunidades. ' + erro.message, 'erro');
        this.carregandoComunidades = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarUsuarios(): void {
    this.carregandoUsuarios = true;
    this.cdr.detectChanges();

    this.usuarioService.obterTodos().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.carregandoUsuarios = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de usuÃ¡rios. ' + erro.message, 'erro');
        this.carregandoUsuarios = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarPessoas(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.fichaService.obterTodos().subscribe({
      next: (pessoas) => {
        this.pessoas = pessoas;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de pessoas. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  getComunidadeNome(id?: number): string {
    if (!id) return '-';
    const comunidade = this.comunidades.find(c => c.id === id);
    return comunidade ? comunidade.nome : '-';
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.pessoasFiltradas = [...this.pessoas];
    } else {
      this.pessoasFiltradas = this.pessoas.filter((item) => {
        const comunidadeNome = this.getComunidadeNome(item.idComunidade).toLowerCase();
        return (
          item.nomeCompleto?.toLowerCase().includes(termo) ||
          item.cpf?.toLowerCase().includes(termo) ||
          item.tituloEleitor?.toLowerCase().includes(termo) ||
          item.telefone?.toLowerCase().includes(termo) ||
          item.whatsapp?.toLowerCase().includes(termo) ||
          item.status?.toLowerCase().includes(termo) ||
          item.origemCadastro?.toLowerCase().includes(termo) ||
          comunidadeNome.includes(termo)
        );
      });
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(pessoa?: Pessoa): void {
    if (pessoa) {
      this.pessoaEdicao = { ...pessoa };
      this.comunidadeSelecionadaId = pessoa.idComunidade ?? '';
      this.usuarioCadastroSelecionadoId = pessoa.idUsuarioCadastro ?? '';
      this.liderResponsavelSelecionadoId = pessoa.idLiderResponsavel ?? '';
      this.liderRegionalSelecionadoId = pessoa.idLiderRegional ?? '';
    } else {
      this.pessoaEdicao = {
        nomeCompleto: '',
        cpf: '',
        tituloEleitor: '',
        nomeMae: '',
        dataNascimento: '',
        telefone: '',
        whatsapp: '',
        enderecoCompleto: '',
        cep: '',
        origemCadastro: '',
        status: '',
        observacoes: ''
      };

      this.comunidadeSelecionadaId = '';
      this.usuarioCadastroSelecionadoId = '';
      this.liderResponsavelSelecionadoId = '';
      this.liderRegionalSelecionadoId = '';
    }

    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.pessoaEdicao = {};
    this.comunidadeSelecionadaId = '';
    this.usuarioCadastroSelecionadoId = '';
    this.liderResponsavelSelecionadoId = '';
    this.liderRegionalSelecionadoId = '';
  }

  salvar(): void {
    if (
      !this.pessoaEdicao.nomeCompleto ||
      !this.pessoaEdicao.cpf ||
      !this.pessoaEdicao.tituloEleitor ||
      !this.pessoaEdicao.nomeMae ||
      !this.pessoaEdicao.dataNascimento ||
      !this.pessoaEdicao.telefone ||
      !this.pessoaEdicao.whatsapp ||
      !this.comunidadeSelecionadaId ||
      !this.pessoaEdicao.enderecoCompleto ||
      !this.pessoaEdicao.cep ||
      !this.pessoaEdicao.origemCadastro ||
      !this.pessoaEdicao.status ||
      !this.usuarioCadastroSelecionadoId
    ) {
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const payload: Pessoa = {
      id: this.pessoaEdicao.id,
      nomeCompleto: this.pessoaEdicao.nomeCompleto.trim(),
      cpf: this.pessoaEdicao.cpf.trim(),
      tituloEleitor: this.pessoaEdicao.tituloEleitor.trim(),
      nomeMae: this.pessoaEdicao.nomeMae.trim(),
      dataNascimento: this.pessoaEdicao.dataNascimento,
      telefone: this.pessoaEdicao.telefone.trim(),
      whatsapp: this.pessoaEdicao.whatsapp.trim(),
      idComunidade: Number(this.comunidadeSelecionadaId),
      enderecoCompleto: this.pessoaEdicao.enderecoCompleto.trim(),
      cep: this.pessoaEdicao.cep.trim(),
      origemCadastro: this.pessoaEdicao.origemCadastro.trim(),
      idLiderResponsavel: this.liderResponsavelSelecionadoId ? Number(this.liderResponsavelSelecionadoId) : null,
      idLiderRegional: this.liderRegionalSelecionadoId ? Number(this.liderRegionalSelecionadoId) : null,
      status: this.pessoaEdicao.status.trim(),
      observacoes: this.pessoaEdicao.observacoes?.trim() || undefined,
      idUsuarioCadastro: Number(this.usuarioCadastroSelecionadoId),
      dataCadastro: this.pessoaEdicao.dataCadastro,
    };

    if (payload.id) {
      this.fichaService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Pessoa atualizada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarPessoas();
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.fichaService.criar(payload).subscribe({
        next: () => {
          this.exibirMensagem('Pessoa cadastrada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarPessoas();
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
    const idParaDeletar = typeof alvo === 'number' ? alvo : alvo?.id;

    if (!idParaDeletar) {
      this.exibirMensagem('Erro: nÃ£o foi possÃ­vel identificar o ID da pessoa.', 'erro');
      return;
    }

    const nomePessoa = typeof alvo === 'object' && alvo?.nomeCompleto ? alvo.nomeCompleto : 'esta pessoa';
    const confirmacao = window.confirm(
      `AtenÃ§Ã£o: tem certeza que deseja excluir ${nomePessoa}? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.fichaService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarPessoas();
        this.carregandoDeletar = false;
        this.exibirMensagem('Pessoa excluÃ­da com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir pessoa. ' + erro.message, 'erro');
        this.carregandoDeletar = false;
        this.cdr.detectChanges();
      },
    });
  }

  exibirMensagem(msg: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagem = msg;
    this.tipoMensagem = tipo;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensagem = '';
      this.cdr.detectChanges();
    }, 4000);
  }

  fecharPainel(): void {
    this.voltar.emit();
  }
}

