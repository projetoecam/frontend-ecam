import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pessoa, FichaService } from '../../../core/services/ficha.service';
import { Comunidade, ComunidadeService } from '../../../core/services/comunidade.service';
import { Usuario, UsuarioService } from '../../../core/services/usuario.service';
import { Municipio, MunicipioService } from '../../../core/services/municipio.service';
import { Bairro, BairroService } from '../../../core/services/bairro.service';

interface DemandaItem {
  selecionado: boolean;
  descricao: string;
}

interface FichaCadastroForm {
  comunidadeId: number | '';
  municipioId: number | '';
  bairroId: number | '';
  nomeRepresentante: string;
  telefone: string;
  cpf: string;
  endereco: string;
  cep: string;
  nomeMae: string;
  supervisao: string;
  coordenacao: string;
  demandas: {
    infraestrutura: DemandaItem;
    saude: DemandaItem;
    educacao: DemandaItem;
    seguranca: DemandaItem;
    outros: DemandaItem;
  };
}

@Component({
  selector: 'app-ficha-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ficha-cadastro.component.html',
  styleUrls: ['./ficha-cadastro.component.css'],
})
export class FichaCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  pessoas: Pessoa[] = [];
  pessoasFiltradas: Pessoa[] = [];
  comunidades: Comunidade[] = [];
  municipios: Municipio[] = [];
  bairros: Bairro[] = [];
  usuarios: Usuario[] = [];

  formularioAberto = false;
  pessoaEdicao: Partial<Pessoa> = {};
  fichaForm: FichaCadastroForm = this.criarFormularioVazio();

  comunidadeSelecionadaId: number | '' = '';

  searchTerm: string = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  carregandoComunidades = false;
  carregandoMunicipios = false;
  carregandoBairros = false;
  carregandoUsuarios = false;

  constructor(
    private fichaService: FichaService,
    private comunidadeService: ComunidadeService,
    private municipioService: MunicipioService,
    private bairroService: BairroService,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarComunidades();
    this.carregarMunicipios();
    this.carregarBairros();
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
        this.exibirMensagem('Falha ao carregar a lista de usuários. ' + erro.message, 'erro');
        this.carregandoUsuarios = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarMunicipios(): void {
    this.carregandoMunicipios = true;
    this.cdr.detectChanges();

    this.municipioService.obterTodos().subscribe({
      next: (municipios) => {
        this.municipios = municipios;
        this.carregandoMunicipios = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de municípios. ' + erro.message, 'erro');
        this.carregandoMunicipios = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarBairros(): void {
    this.carregandoBairros = true;
    this.cdr.detectChanges();

    this.bairroService.obterTodos().subscribe({
      next: (bairros) => {
        this.bairros = bairros;
        this.carregandoBairros = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de bairros. ' + erro.message, 'erro');
        this.carregandoBairros = false;
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

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.pessoasFiltradas = [...this.pessoas];
    } else {
      this.pessoasFiltradas = this.pessoas.filter((item) => {
        const comunidadeNome = item.comunidade?.nome?.toLowerCase() ?? '';
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
      this.pessoaEdicao = {
        ...pessoa,
        comunidade: pessoa.comunidade ? { ...pessoa.comunidade } : undefined,
        usuarioCadastro: pessoa.usuarioCadastro ? { ...pessoa.usuarioCadastro } : undefined,
      };
      this.comunidadeSelecionadaId = pessoa.comunidade?.id ?? '';

      this.fichaForm = this.criarFormularioVazio();
      this.fichaForm.comunidadeId = pessoa.comunidade?.id ?? '';
      this.fichaForm.nomeRepresentante = pessoa.nomeCompleto ?? '';
      this.fichaForm.telefone = pessoa.telefone ?? '';
      this.fichaForm.cpf = pessoa.cpf ?? '';
      this.fichaForm.endereco = pessoa.enderecoCompleto ?? '';
      this.fichaForm.cep = pessoa.cep ?? '';
      this.fichaForm.nomeMae = pessoa.nomeMae ?? '';

      this.hidratarFormularioAPartirObservacoes(pessoa.observacoes);
    } else {
      this.pessoaEdicao = {};
      this.fichaForm = this.criarFormularioVazio();
      this.comunidadeSelecionadaId = '';
    }

    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.pessoaEdicao = {};
    this.fichaForm = this.criarFormularioVazio();
    this.comunidadeSelecionadaId = '';
  }

  limparFormulario(): void {
    this.fichaForm = this.criarFormularioVazio();
    this.comunidadeSelecionadaId = '';
    this.cdr.detectChanges();
  }

  salvar(): void {
    if (
      !this.fichaForm.comunidadeId ||
      !this.fichaForm.municipioId ||
      !this.fichaForm.bairroId ||
      !this.fichaForm.nomeRepresentante.trim() ||
      !this.fichaForm.telefone.trim() ||
      !this.fichaForm.cpf.trim() ||
      !this.fichaForm.endereco.trim() ||
      !this.fichaForm.cep.trim() ||
      !this.fichaForm.nomeMae.trim()
    ) {
      this.exibirMensagem('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const comunidadeSelecionada =
      this.comunidades.find((item) => item.id === this.fichaForm.comunidadeId) || null;
    const usuarioCadastroSelecionado = this.buscarUsuarioCadastro();

    if (!comunidadeSelecionada || !usuarioCadastroSelecionado) {
      this.exibirMensagem('Comunidade ou usuário de cadastro não encontrado para salvar.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const payload: Pessoa = {
      id: this.pessoaEdicao.id,
      nomeCompleto: this.fichaForm.nomeRepresentante.trim(),
      cpf: this.fichaForm.cpf.trim(),
      tituloEleitor: this.pessoaEdicao.tituloEleitor?.trim() || 'NAO_INFORMADO',
      nomeMae: this.fichaForm.nomeMae.trim(),
      dataNascimento: this.pessoaEdicao.dataNascimento || '1900-01-01',
      telefone: this.fichaForm.telefone.trim(),
      whatsapp: this.fichaForm.telefone.trim(),
      comunidade: { ...comunidadeSelecionada },
      enderecoCompleto: this.fichaForm.endereco.trim(),
      cep: this.fichaForm.cep.trim(),
      origemCadastro: this.pessoaEdicao.origemCadastro?.trim() || 'CADASTRO_COMUNIDADE',
      liderResponsavel: null,
      liderRegional: null,
      status: this.pessoaEdicao.status?.trim() || 'ATIVO',
      observacoes: this.montarObservacoesFicha(),
      usuarioCadastro: { ...usuarioCadastroSelecionado },
      dataCadastro: this.pessoaEdicao.dataCadastro,
    };

    if (payload.id) {
      this.fichaService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Ficha atualizada com sucesso.', 'sucesso');
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
          this.exibirMensagem('Ficha cadastrada com sucesso.', 'sucesso');
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
      this.exibirMensagem('Erro: não foi possível identificar o ID da pessoa.', 'erro');
      return;
    }

    const nomePessoa = typeof alvo === 'object' && alvo?.nomeCompleto ? alvo.nomeCompleto : 'esta pessoa';
    const confirmacao = window.confirm(
      `Atenção: tem certeza que deseja excluir ${nomePessoa}? Esta ação não poderá ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.fichaService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarPessoas();
        this.carregandoDeletar = false;
        this.exibirMensagem('Pessoa excluída com sucesso.', 'sucesso');
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

  formatarTelefone(): void {
    const digitos = this.fichaForm.telefone.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 10) {
      this.fichaForm.telefone = digitos.replace(/(\d{2})(\d{4})(\d{0,4})/, (_m, d1, d2, d3) =>
        d3 ? `(${d1}) ${d2}-${d3}` : `(${d1}) ${d2}`,
      );
      return;
    }

    this.fichaForm.telefone = digitos.replace(/(\d{2})(\d{5})(\d{0,4})/, (_m, d1, d2, d3) =>
      d3 ? `(${d1}) ${d2}-${d3}` : `(${d1}) ${d2}`,
    );
  }

  formatarCpf(): void {
    const digitos = this.fichaForm.cpf.replace(/\D/g, '').slice(0, 11);
    this.fichaForm.cpf = digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_m, d1, d2, d3, d4) =>
      d4 ? `${d1}.${d2}.${d3}-${d4}` : `${d1}.${d2}.${d3}`,
    );
  }

  formatarCep(): void {
    const digitos = this.fichaForm.cep.replace(/\D/g, '').slice(0, 8);
    this.fichaForm.cep = digitos.replace(/(\d{5})(\d{0,3})/, (_m, d1, d2) =>
      d2 ? `${d1}-${d2}` : d1,
    );
  }

  private criarFormularioVazio(): FichaCadastroForm {
    return {
      comunidadeId: '',
      municipioId: '',
      bairroId: '',
      nomeRepresentante: '',
      telefone: '',
      cpf: '',
      endereco: '',
      cep: '',
      nomeMae: '',
      supervisao: '',
      coordenacao: '',
      demandas: {
        infraestrutura: { selecionado: false, descricao: '' },
        saude: { selecionado: false, descricao: '' },
        educacao: { selecionado: false, descricao: '' },
        seguranca: { selecionado: false, descricao: '' },
        outros: { selecionado: false, descricao: '' },
      },
    };
  }

  private buscarUsuarioCadastro(): Usuario | null {
    if (this.pessoaEdicao.usuarioCadastro?.id) {
      const usuarioAtual = this.usuarios.find((u) => u.id === this.pessoaEdicao.usuarioCadastro?.id);
      if (usuarioAtual) {
        return usuarioAtual;
      }
    }

    const loginLocal = (localStorage.getItem('usuario') || '').toLowerCase().trim();
    if (loginLocal) {
      const usuarioLogado = this.usuarios.find(
        (u) => u.login_usuario?.toLowerCase().trim() === loginLocal || u.nome?.toLowerCase().trim() === loginLocal,
      );
      if (usuarioLogado) {
        return usuarioLogado;
      }
    }

    return this.usuarios[0] || null;
  }

  private montarObservacoesFicha(): string {
    const municipioSelecionado =
      this.municipios.find((item) => item.id === this.fichaForm.municipioId)?.nome || '-';
    const bairroSelecionado = this.bairros.find((item) => item.id === this.fichaForm.bairroId)?.nome || '-';

    const linhasDemandas = [
      { chave: 'Infraestrutura', item: this.fichaForm.demandas.infraestrutura },
      { chave: 'Saúde', item: this.fichaForm.demandas.saude },
      { chave: 'Educação', item: this.fichaForm.demandas.educacao },
      { chave: 'Segurança', item: this.fichaForm.demandas.seguranca },
      { chave: 'Outros', item: this.fichaForm.demandas.outros },
    ]
      .filter((d) => d.item.selecionado)
      .map((d) => `- ${d.chave}: ${d.item.descricao?.trim() || 'Sem descrição informada'}`);

    const linhas = [
      '[FICHA_CADASTRO_COMUNIDADE]',
      `Municipio: ${municipioSelecionado}`,
      `Bairro: ${bairroSelecionado}`,
      `Supervisao: ${this.fichaForm.supervisao.trim() || '-'}`,
      `Coordenacao: ${this.fichaForm.coordenacao.trim() || '-'}`,
      'Demandas:',
      ...(linhasDemandas.length ? linhasDemandas : ['- Nenhuma demanda marcada']),
    ];

    return linhas.join('\n');
  }

  private hidratarFormularioAPartirObservacoes(observacoes?: string): void {
    if (!observacoes?.includes('[FICHA_CADASTRO_COMUNIDADE]')) {
      return;
    }

    const lerValor = (prefixo: string) => {
      const linha = observacoes
        .split('\n')
        .find((item) => item.toLowerCase().startsWith(prefixo.toLowerCase()));

      return linha ? linha.substring(prefixo.length).trim() : '';
    };

    const nomeMunicipio = lerValor('Municipio:');
    const nomeBairro = lerValor('Bairro:');

    this.fichaForm.municipioId =
      this.municipios.find((item) => item.nome.toLowerCase().trim() === nomeMunicipio.toLowerCase().trim())?.id ||
      '';
    this.fichaForm.bairroId =
      this.bairros.find((item) => item.nome.toLowerCase().trim() === nomeBairro.toLowerCase().trim())?.id || '';
    this.fichaForm.supervisao = lerValor('Supervisao:');
    this.fichaForm.coordenacao = lerValor('Coordenacao:');

    this.aplicarDemandaPorNome(observacoes, 'Infraestrutura', this.fichaForm.demandas.infraestrutura);
    this.aplicarDemandaPorNome(observacoes, 'Saúde', this.fichaForm.demandas.saude);
    this.aplicarDemandaPorNome(observacoes, 'Educação', this.fichaForm.demandas.educacao);
    this.aplicarDemandaPorNome(observacoes, 'Segurança', this.fichaForm.demandas.seguranca);
    this.aplicarDemandaPorNome(observacoes, 'Outros', this.fichaForm.demandas.outros);
  }

  private aplicarDemandaPorNome(texto: string, nome: string, destino: DemandaItem): void {
    const linha = texto.split('\n').find((item) => item.startsWith(`- ${nome}:`));
    if (!linha) {
      return;
    }

    destino.selecionado = true;
    destino.descricao = linha.replace(`- ${nome}:`, '').trim();
  }

  fecharPainel(): void {
    this.voltar.emit();
  }
}
