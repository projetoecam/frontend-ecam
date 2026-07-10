import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MunicipioService, Municipio } from '../../../../../core/services/municipio.service';
import { MacroRegiao, MacroRegiaoService } from '../../../../../core/services/macro-regiao.service';

@Component({
  selector: 'app-macro-regiao-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './macro-regiao-cadastro.component.html',
  styleUrls: ['./macro-regiao-cadastro.component.css'],
})
export class MacroRegiaoCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  // Nota: Garante que a interface MacroRegiao no teu macro-regiao.service.ts tem os campos:
  // id?: number; nome: string; regiaoApelido?: string; idMunicipio?: number; nomeMunicipio?: string;
  macroRegioes: any[] = []; // Usando any[] para evitar erros de tipagem caso a interface nÃ£o esteja atualizada
  macroRegioesFiltradas: any[] = [];
  municipios: Municipio[] = [];

  formularioAberto = false;
  macroRegiaoEdicao: any = {};
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
        this.exibirMensagem('Falha ao carregar a lista de municÃ­pios. ' + erro.message, 'erro');
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
        this.exibirMensagem('Falha ao carregar a lista de macro regiÃµes. ' + erro.message, 'erro');
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
        // Agora usamos os dados planos que vÃªm do DTO
        const municipioNome = item.nomeMunicipio?.toLowerCase() ?? '';
        
        return (
          item.nome?.toLowerCase().includes(termo) ||
          item.regiaoApelido?.toLowerCase().includes(termo) ||
          municipioNome.includes(termo)
        );
      });
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(macroRegiao?: any): void {
    if (macroRegiao) {
      this.macroRegiaoEdicao = { ...macroRegiao };
      this.municipioSelecionadoId = macroRegiao.idMunicipio ?? '';
    } else {
      this.macroRegiaoEdicao = { nome: '', regiaoApelido: '' };
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
    if (!this.macroRegiaoEdicao.nome || !this.macroRegiaoEdicao.regiaoApelido || !this.municipioSelecionadoId) {
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    const nomeNormalizado = this.macroRegiaoEdicao.nome.trim();
    const apelidoNormalizado = this.macroRegiaoEdicao.regiaoApelido.trim();

    if (!nomeNormalizado || !apelidoNormalizado) {
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    // Novo payload de acordo com o DTO do backend
    const payload: any = {
      id: this.macroRegiaoEdicao.id,
      nome: nomeNormalizado,
      regiaoApelido: apelidoNormalizado,
      idMunicipio: this.municipioSelecionadoId,
    };

    if (payload.id) {
      this.macroRegiaoService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Macro regiÃ£o atualizada com sucesso.', 'sucesso');
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
          this.exibirMensagem('Macro regiÃ£o cadastrada com sucesso.', 'sucesso');
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
      this.exibirMensagem('Erro: nÃ£o foi possÃ­vel identificar o ID da macro regiÃ£o.', 'erro');
      return;
    }

    const nomeMacroRegiao = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'esta macro regiÃ£o';
    const confirmacao = window.confirm(
      `AtenÃ§Ã£o: tem certeza que deseja excluir ${nomeMacroRegiao}? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.macroRegiaoService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarMacroRegioes();
        this.carregandoDeletar = false;
        this.exibirMensagem('Macro regiÃ£o excluÃ­da com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir macro regiÃ£o. ' + erro.message, 'erro');
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

