import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MacroRegiao, MacroRegiaoService } from '../../../../../core/services/macro-regiao.service';
import { Bairro, BairroService } from '../../../../../core/services/bairro.service';

@Component({
  selector: 'app-bairro-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bairro-cadastro.component.html',
  styleUrls: ['./bairro-cadastro.component.css'],
})
export class BairroCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  bairros: Bairro[] = [];
  bairrosFiltrados: Bairro[] = [];
  macroRegioes: MacroRegiao[] = [];

  formularioAberto = false;
  bairroEdicao: Partial<Bairro> = {};
  macroRegiaoSelecionadaId: number | '' = '';
  searchTerm: string = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  carregandoMacroRegioes = false;

  constructor(
    private bairroService: BairroService,
    private macroRegiaoService: MacroRegiaoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarMacroRegioes();
    this.carregarBairros();
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
        this.exibirMensagem('Falha ao carregar a lista de macro regiÃµes. ' + erro.message, 'erro');
        this.carregandoMacroRegioes = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarBairros(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.bairroService.obterTodos().subscribe({
      next: (bairros) => {
        this.bairros = bairros;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de bairros. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.bairrosFiltrados = [...this.bairros];
    } else {
      this.bairrosFiltrados = this.bairros.filter((item) => {
        const macroNome = item.macroRegiao?.nome?.toLowerCase() ?? '';
        const macroApelido = item.macroRegiao?.regiao_apelido?.toLowerCase() ?? '';
        return (
          item.nome?.toLowerCase().includes(termo) ||
          macroNome.includes(termo) ||
          macroApelido.includes(termo)
        );
      });
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(bairro?: Bairro): void {
    if (bairro) {
      this.bairroEdicao = {
        ...bairro,
        macroRegiao: bairro.macroRegiao ? { ...bairro.macroRegiao } : undefined,
      };
      this.macroRegiaoSelecionadaId = bairro.macroRegiao?.id ?? '';
    } else {
      this.bairroEdicao = { nome: '', macroRegiao: undefined };
      this.macroRegiaoSelecionadaId = '';
    }

    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.bairroEdicao = {};
    this.macroRegiaoSelecionadaId = '';
  }

  salvar(): void {
    if (!this.bairroEdicao.nome || !this.macroRegiaoSelecionadaId) {
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    const nomeNormalizado = this.bairroEdicao.nome.trim();
    const macroRegiao = this.macroRegioes.find((item) => item.id === this.macroRegiaoSelecionadaId) || null;

    if (!nomeNormalizado || !macroRegiao) {
      this.exibirMensagem('Selecione uma macro regiÃ£o vÃ¡lida e preencha o nome.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const payload: Bairro = {
      id: this.bairroEdicao.id,
      nome: nomeNormalizado,
      macroRegiao: { ...macroRegiao },
    };

    if (payload.id) {
      this.bairroService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Bairro atualizado com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarBairros();
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.bairroService.criar(payload).subscribe({
        next: () => {
          this.exibirMensagem('Bairro cadastrado com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarBairros();
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
      this.exibirMensagem('Erro: nÃ£o foi possÃ­vel identificar o ID do bairro.', 'erro');
      return;
    }

    const nomeBairro = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este bairro';
    const confirmacao = window.confirm(
      `AtenÃ§Ã£o: tem certeza que deseja excluir ${nomeBairro}? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.bairroService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarBairros();
        this.carregandoDeletar = false;
        this.exibirMensagem('Bairro excluÃ­do com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir bairro. ' + erro.message, 'erro');
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

  get nomeMacroRegiaoSelecionada(): string {
    const macroRegiao = this.macroRegioes.find((item) => item.id === this.macroRegiaoSelecionadaId);
    return macroRegiao ? `${macroRegiao.nome} (${macroRegiao.regiao_apelido})` : '';
  }

  fecharPainel(): void {
    this.voltar.emit();
  }
}

