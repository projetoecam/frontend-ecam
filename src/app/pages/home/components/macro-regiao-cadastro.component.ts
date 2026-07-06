import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MunicipioService, Municipio } from '../../../core/services/municipio.service';
import { MacroRegiao, MacroRegiaoService } from '../../../core/services/macro-regiao.service';

@Component({
  selector: 'app-macro-regiao-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './macro-regiao-cadastro.component.html',
  styleUrls: ['./macro-regiao-cadastro.component.css'],
})
export class MacroRegiaoCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  macroRegioes: MacroRegiao[] = [];
  macroRegioesFiltradas: MacroRegiao[] = [];
  municipios: Municipio[] = [];

  formularioAberto = false;
  macroRegiaoEdicao: Partial<MacroRegiao> = {};
  municipioSelecionadoId: number | '' = '';
  searchTerm: string = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  carregandoMunicipios = false;

  constructor(
    private macroRegiaoService: MacroRegiaoService,
    private municipioService: MunicipioService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarMunicipios();
    this.carregarMacroRegioes();
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

  carregarMacroRegioes(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.macroRegiaoService.obterTodos().subscribe({
      next: (macroRegioes) => {
        this.macroRegioes = macroRegioes;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de macro regiões. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.macroRegioesFiltradas = [...this.macroRegioes];
    } else {
      this.macroRegioesFiltradas = this.macroRegioes.filter((item) => {
        const municipioNome = item.municipio?.nome?.toLowerCase() ?? '';
        const municipioUf = item.municipio?.uf?.toLowerCase() ?? '';
        return (
          item.nome?.toLowerCase().includes(termo) ||
          item.regiao_apelido?.toLowerCase().includes(termo) ||
          municipioNome.includes(termo) ||
          municipioUf.includes(termo)
        );
      });
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(macroRegiao?: MacroRegiao): void {
    if (macroRegiao) {
      this.macroRegiaoEdicao = {
        ...macroRegiao,
        municipio: macroRegiao.municipio ? { ...macroRegiao.municipio } : undefined,
      };
      this.municipioSelecionadoId = macroRegiao.municipio?.id ?? '';
    } else {
      this.macroRegiaoEdicao = { nome: '', regiao_apelido: '', municipio: undefined };
      this.municipioSelecionadoId = '';
    }

    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.macroRegiaoEdicao = {};
    this.municipioSelecionadoId = '';
  }

  salvar(): void {
    if (!this.macroRegiaoEdicao.nome || !this.macroRegiaoEdicao.regiao_apelido || !this.municipioSelecionadoId) {
      this.exibirMensagem('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const nomeNormalizado = this.macroRegiaoEdicao.nome.trim();
    const apelidoNormalizado = this.macroRegiaoEdicao.regiao_apelido.trim();
    const municipio = this.municipios.find((item) => item.id === this.municipioSelecionadoId) || null;

    if (!nomeNormalizado || !apelidoNormalizado || !municipio) {
      this.exibirMensagem('Selecione um município válido e preencha os campos obrigatórios.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const payload: MacroRegiao = {
      id: this.macroRegiaoEdicao.id,
      nome: nomeNormalizado,
      regiao_apelido: apelidoNormalizado,
      municipio: { ...municipio },
    };

    if (payload.id) {
      this.macroRegiaoService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Macro região atualizada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarMacroRegioes();
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.macroRegiaoService.criar(payload).subscribe({
        next: () => {
          this.exibirMensagem('Macro região cadastrada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarMacroRegioes();
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
      this.exibirMensagem('Erro: não foi possível identificar o ID da macro região.', 'erro');
      return;
    }

    const nomeMacroRegiao = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'esta macro região';
    const confirmacao = window.confirm(
      `Atenção: tem certeza que deseja excluir ${nomeMacroRegiao}? Esta ação não poderá ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.macroRegiaoService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarMacroRegioes();
        this.carregandoDeletar = false;
        this.exibirMensagem('Macro região excluída com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir macro região. ' + erro.message, 'erro');
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

  get nomeMunicipioSelecionado(): string {
    const municipio = this.municipios.find((item) => item.id === this.municipioSelecionadoId);
    return municipio ? `${municipio.nome} - ${municipio.uf}` : '';
  }

  fecharPainel(): void {
    this.voltar.emit();
  }
}
