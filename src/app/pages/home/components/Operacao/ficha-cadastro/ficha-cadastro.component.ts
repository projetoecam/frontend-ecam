import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { concatMap } from 'rxjs/operators';
import { Pessoa, FichaService } from '../../../../../core/services/ficha.service';
import { Comunidade, ComunidadeService } from '../../../../../core/services/comunidade.service';
import { Usuario, UsuarioService } from '../../../../../core/services/usuario.service';
import { Municipio, MunicipioService } from '../../../../../core/services/municipio.service';
import { Bairro, BairroService } from '../../../../../core/services/bairro.service';
import { Demanda, DemandaService } from '../../../../../core/services/demanda.service';
import { DemandaTipo, DemandaTipoService } from '../../../../../core/services/demanda-tipo.service';
import { OperationFeedbackService } from '../../../../../shared/services/operation-feedback.service';
import { OperationConfirmService } from '../../../../../shared/services/operation-confirm.service';

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
    private demandaService: DemandaService,
    private demandaTipoService: DemandaTipoService,
    private cdr: ChangeDetectorRef,
    private operationFeedback: OperationFeedbackService,
    private operationConfirm: OperationConfirmService,
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

  getComunidadeNome(id?: number): string {
    if (!id) return '-';
    const comunidade = this.comunidades.find(c => c.id === id);
    return comunidade ? comunidade.nome : '-';
  }

  getLiderNome(id?: number | null): string {
    if (!id) return '-';
    const lider = this.pessoas.find(p => p.id === id);
    return lider ? lider.nomeCompleto : '-';
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
          item.telefone?.toLowerCase().includes(termo) ||
          comunidadeNome.includes(termo)
        );
      });
    }
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  // --- NOVA LÓGICA DE AUTO-PREENCHIMENTO ---
  onComunidadeChange(): void {
    if (!this.fichaForm.comunidadeId) return;

    const comunidade = this.comunidades.find(c => c.id === this.fichaForm.comunidadeId);
    
    if (comunidade && comunidade.idBairro) {
      this.fichaForm.bairroId = comunidade.idBairro;
      
      // Auto-selecionar município para facilitar (se houver pelo menos um na lista)
      if (this.municipios.length > 0 && !this.fichaForm.municipioId) {
        this.fichaForm.municipioId = this.municipios[0].id || '';
      }
    }
    this.cdr.detectChanges();
  }

  abrirFormulario(pessoa?: Pessoa): void {
    if (pessoa) {
      this.pessoaEdicao = { ...pessoa };
      this.comunidadeSelecionadaId = pessoa.idComunidade ?? '';

      this.fichaForm = this.criarFormularioVazio();
      this.fichaForm.comunidadeId = pessoa.idComunidade ?? '';
      this.fichaForm.nomeRepresentante = pessoa.nomeCompleto ?? '';
      this.fichaForm.telefone = pessoa.telefone ?? '';
      this.fichaForm.cpf = pessoa.cpf ?? '';
      this.fichaForm.endereco = pessoa.enderecoCompleto ?? '';
      this.fichaForm.cep = pessoa.cep ?? '';
      this.fichaForm.nomeMae = pessoa.nomeMae ?? '';
      
      // Ao abrir para edição, force a atualização dos campos dependentes (Bairro e Municipio)
      this.onComunidadeChange();
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
      !this.fichaForm.cpf.trim()
    ) {
      this.exibirMensagem('Preencha os campos obrigatórios (Comunidade, Bairro, Município, Nome, Telefone e CPF).', 'erro');
      return;
    }

    const usuarioCadastroSelecionado = this.buscarUsuarioCadastro();
    if (!usuarioCadastroSelecionado) {
      this.exibirMensagem('Usuário de cadastro não encontrado.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    // 1. DTO DA PESSOA
    const pessoaPayload: Pessoa = {
      id: this.pessoaEdicao.id,
      nomeCompleto: this.fichaForm.nomeRepresentante.trim(),
      cpf: this.fichaForm.cpf.trim(),
      tituloEleitor: this.pessoaEdicao.tituloEleitor?.trim() || 'NAO_INFORMADO',
      nomeMae: this.fichaForm.nomeMae.trim(),
      dataNascimento: this.pessoaEdicao.dataNascimento || '1900-01-01',
      telefone: this.fichaForm.telefone.trim(),
      whatsapp: this.fichaForm.telefone.trim(),
      idComunidade: Number(this.fichaForm.comunidadeId),
      enderecoCompleto: this.fichaForm.endereco.trim(),
      cep: this.fichaForm.cep.trim(),
      origemCadastro: 'CADASTRO_FICHA_DEMANDA',
      idLiderResponsavel: null,
      idLiderRegional: null,
      status: 'ATIVO',
      idUsuarioCadastro: Number(usuarioCadastroSelecionado.id),
      dataCadastro: this.pessoaEdicao.dataCadastro,
    };

    // Chamada encadeada RxJS para garantir a ordem exata de gravação
    const salvarPessoa$ = pessoaPayload.id
      ? this.fichaService.atualizar(pessoaPayload.id, pessoaPayload)
      : this.fichaService.criar(pessoaPayload);

    salvarPessoa$.pipe(
      concatMap((pessoaSalva) => {
        // 2. DTO DA DEMANDA
        const orgao = [this.fichaForm.supervisao.trim(), this.fichaForm.coordenacao.trim()].filter(Boolean).join(' / ');
        const demandaPayload: Demanda = {
          idSolicitante: pessoaSalva.id,
          idComunidade: Number(this.fichaForm.comunidadeId),
          idLiderResponsavel: null,
          orgaoResponsavel: orgao || 'NÃO INFORMADO',
          status: 'NOVO',
          dataSolicitacao: new Date().toISOString().split('T')[0],
          idOperador: Number(usuarioCadastroSelecionado.id)
        };
        return this.demandaService.criar(demandaPayload);
      }),
      concatMap((demandaSalva) => {
        // 3. DTO DO TIPO DE DEMANDA (Detalhes da Ficha)
        const demandaTipoPayload: DemandaTipo = {
          idDemanda: demandaSalva.id,
          tipoSaude: this.fichaForm.demandas.saude.selecionado,
          descricaoTipoSaude: this.fichaForm.demandas.saude.descricao || undefined,
          tipoInfraestrutura: this.fichaForm.demandas.infraestrutura.selecionado,
          descricaoTipoInfraestrutura: this.fichaForm.demandas.infraestrutura.descricao || undefined,
          tipoEducacao: this.fichaForm.demandas.educacao.selecionado,
          descricaoTipoEducacao: this.fichaForm.demandas.educacao.descricao || undefined,
          tipoSeguranca: this.fichaForm.demandas.seguranca.selecionado,
          descricaoTipoSeguranca: this.fichaForm.demandas.seguranca.descricao || undefined,
          tipoOutros: this.fichaForm.demandas.outros.selecionado,
          descricaoTipoOutros: this.fichaForm.demandas.outros.descricao || undefined,
        };
        return this.demandaTipoService.criar(demandaTipoPayload);
      })
    ).subscribe({
      next: () => {
        this.exibirMensagem('Ficha processada com sucesso (Pessoa, Demanda e Tipos de Demanda criados)!', 'sucesso', () => {
          this.fecharFormulario();
          this.carregarPessoas();
        });
        this.carregandoSalvar = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao processar as integrações. ' + erro.message, 'erro');
        this.carregandoSalvar = false;
        this.cdr.detectChanges();
      }
    });
  }

  async deletar(alvo: any): Promise<void> {
    const idParaDeletar = typeof alvo === 'number' ? alvo : alvo?.id;
    if (!idParaDeletar) return;

    const confirmacao = await this.operationConfirm.confirm({
      title: 'Excluir registro',
      message: 'Tem certeza que deseja excluir este registro? Esta ação não poderá ser desfeita.',
      confirmText: 'Sim, excluir',
      cancelText: 'Voltar',
    });
    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.fichaService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarPessoas();
        this.carregandoDeletar = false;
        this.exibirMensagem('Excluído com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir. ' + erro.message, 'erro');
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

  formatarTelefone(): void {
    const digitos = this.fichaForm.telefone.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 10) {
      this.fichaForm.telefone = digitos.replace(/(\d{2})(\d{4})(\d{0,4})/, (_m, d1, d2, d3) => d3 ? `(${d1}) ${d2}-${d3}` : `(${d1}) ${d2}`);
      return;
    }
    this.fichaForm.telefone = digitos.replace(/(\d{2})(\d{5})(\d{0,4})/, (_m, d1, d2, d3) => d3 ? `(${d1}) ${d2}-${d3}` : `(${d1}) ${d2}`);
  }

  formatarCpf(): void {
    const digitos = this.fichaForm.cpf.replace(/\D/g, '').slice(0, 11);
    this.fichaForm.cpf = digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, (_m, d1, d2, d3, d4) => d4 ? `${d1}.${d2}.${d3}-${d4}` : `${d1}.${d2}.${d3}`);
  }

  formatarCep(): void {
    const digitos = this.fichaForm.cep.replace(/\D/g, '').slice(0, 8);
    this.fichaForm.cep = digitos.replace(/(\d{5})(\d{0,3})/, (_m, d1, d2) => d2 ? `${d1}-${d2}` : d1);
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
    if (this.pessoaEdicao.idUsuarioCadastro) {
      const usuarioAtual = this.usuarios.find((u) => u.id === this.pessoaEdicao.idUsuarioCadastro);
      if (usuarioAtual) return usuarioAtual;
    }
    const loginLocal = (localStorage.getItem('usuario') || '').toLowerCase().trim();
    if (loginLocal) {
      const usuarioLogado = this.usuarios.find(
        (u) => u.login_usuario?.toLowerCase().trim() === loginLocal || u.nome?.toLowerCase().trim() === loginLocal,
      );
      if (usuarioLogado) return usuarioLogado;
    }
    return this.usuarios[0] || null;
  }

  fecharPainel(): void {
    this.voltar.emit();
  }
}


