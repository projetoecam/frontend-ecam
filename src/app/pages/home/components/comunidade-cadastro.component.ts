import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Bairro, BairroService } from '../../../core/services/bairro.service';
import { MacroRegiao, MacroRegiaoService } from '../../../core/services/macro-regiao.service';
import { Comunidade, ComunidadeService } from '../../../core/services/comunidade.service';

@Component({
  selector: 'app-comunidade-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunidade-cadastro.component.html',
  styleUrls: ['./comunidade-cadastro.component.css'],
})
export class ComunidadeCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  comunidades: Comunidade[] = [];
  comunidadesFiltradas: Comunidade[] = [];
  bairros: Bairro[] = [];
  macroRegioes: MacroRegiao[] = [];

  formularioAberto = false;
  comunidadeEdicao: Partial<Comunidade> = {};
  bairroSelecionadoId: number | '' = '';
  macroRegiaoSelecionadaId: number | '' = '';
  searchTerm: string = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  carregandoBairros = false;
  carregandoMacroRegioes = false;

  grausPrioridade = ['Baixa', 'Média', 'Alta', 'Crítica'];
  classificacoes = ['Residencial', 'Comercial', 'Mista', 'Rural'];

  constructor(
    private comunidadeService: ComunidadeService,
    private bairroService: BairroService,
    private macroRegiaoService: MacroRegiaoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarBairros();
    this.carregarMacroRegioes();
    this.carregarComunidades();
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

  carregarMacroRegioes(): void {
    this.carregandoMacroRegioes = true;
    this.cdr.detectChanges();

    this.macroRegiaoService.obterTodos().subscribe({
      next: (macroRegioes) => {
        this.macroRegioes = macroRegioes;
        this.carregandoMacroRegioes = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de macro regiões. ' + erro.message, 'erro');
        this.carregandoMacroRegioes = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarComunidades(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.comunidadeService.obterTodos().subscribe({
      next: (comunidades) => {
        this.comunidades = comunidades;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de comunidades. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.comunidadesFiltradas = [...this.comunidades];
    } else {
      this.comunidadesFiltradas = this.comunidades.filter((item) => {
        const bairroNome = item.bairro?.nome?.toLowerCase() ?? '';
        const macroNome = item.macroRegiao?.nome?.toLowerCase() ?? '';
        const macroApelido = item.macroRegiao?.regiao_apelido?.toLowerCase() ?? '';
        return (
          item.nome?.toLowerCase().includes(termo) ||
          bairroNome.includes(termo) ||
          macroNome.includes(termo) ||
          macroApelido.includes(termo) ||
          item.cep?.toLowerCase().includes(termo) ||
          item.classificacao?.toLowerCase().includes(termo) ||
          item.grauPrioridade?.toLowerCase().includes(termo)
        );
      });
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(comunidade?: Comunidade): void {
    if (comunidade) {
      this.comunidadeEdicao = {
        ...comunidade,
        bairro: comunidade.bairro ? { ...comunidade.bairro } : undefined,
        macroRegiao: comunidade.macroRegiao ? { ...comunidade.macroRegiao } : undefined,
      };
      this.bairroSelecionadoId = comunidade.bairro?.id ?? '';
      this.macroRegiaoSelecionadaId = comunidade.macroRegiao?.id ?? '';
    } else {
      this.comunidadeEdicao = {
        nome: '',
        bairro: undefined,
        macroRegiao: undefined,
        cep: '',
        enderecoPrincipal: '',
        pontoReferencia: '',
        qtdAproximadaMoradores: null,
        grauPrioridade: '',
        classificacao: '',
      };
      this.bairroSelecionadoId = '';
      this.macroRegiaoSelecionadaId = '';
    }

    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.comunidadeEdicao = {};
    this.bairroSelecionadoId = '';
    this.macroRegiaoSelecionadaId = '';
  }

  salvar(): void {
    if (!this.comunidadeEdicao.nome || !this.bairroSelecionadoId) {
      this.exibirMensagem('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const nomeNormalizado = this.comunidadeEdicao.nome.trim();
    const bairro = this.bairros.find((item) => item.id === this.bairroSelecionadoId) || null;
    const macroRegiao = this.macroRegiaoSelecionadaId
      ? this.macroRegioes.find((item) => item.id === this.macroRegiaoSelecionadaId) || null
      : null;
    const cepNormalizado = this.comunidadeEdicao.cep?.trim() || '';
    const enderecoNormalizado = this.comunidadeEdicao.enderecoPrincipal?.trim() || '';
    const pontoReferenciaNormalizado = this.comunidadeEdicao.pontoReferencia?.trim() || '';
    const grauPrioridadeNormalizado = this.comunidadeEdicao.grauPrioridade?.trim() || '';
    const classificacaoNormalizada = this.comunidadeEdicao.classificacao?.trim() || '';

    if (!nomeNormalizado || !bairro) {
      this.exibirMensagem('Selecione um bairro válido e preencha o nome.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const payload: Comunidade = {
      id: this.comunidadeEdicao.id,
      nome: nomeNormalizado,
      bairro: { ...bairro },
      macroRegiao: macroRegiao ? { ...macroRegiao } : null,
      cep: cepNormalizado || undefined,
      enderecoPrincipal: enderecoNormalizado || undefined,
      pontoReferencia: pontoReferenciaNormalizado || undefined,
      qtdAproximadaMoradores: this.comunidadeEdicao.qtdAproximadaMoradores ?? null,
      grauPrioridade: grauPrioridadeNormalizado || undefined,
      classificacao: classificacaoNormalizada || undefined,
    };

    if (payload.id) {
      this.comunidadeService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Comunidade atualizada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarComunidades();
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.comunidadeService.criar(payload).subscribe({
        next: () => {
          this.exibirMensagem('Comunidade cadastrada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarComunidades();
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
      this.exibirMensagem('Erro: não foi possível identificar o ID da comunidade.', 'erro');
      return;
    }

    const nomeComunidade = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'esta comunidade';
    const confirmacao = window.confirm(
      `Atenção: tem certeza que deseja excluir ${nomeComunidade}? Esta ação não poderá ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.comunidadeService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarComunidades();
        this.carregandoDeletar = false;
        this.exibirMensagem('Comunidade excluída com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir comunidade. ' + erro.message, 'erro');
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

  get nomeBairroSelecionado(): string {
    const bairro = this.bairros.find((item) => item.id === this.bairroSelecionadoId);
    return bairro ? bairro.nome : '';
  }

  get nomeMacroRegiaoSelecionada(): string {
    const macroRegiao = this.macroRegioes.find((item) => item.id === this.macroRegiaoSelecionadaId);
    return macroRegiao ? `${macroRegiao.nome} (${macroRegiao.regiao_apelido})` : '';
  }

  fecharPainel(): void {
    this.voltar.emit();
  }
}
