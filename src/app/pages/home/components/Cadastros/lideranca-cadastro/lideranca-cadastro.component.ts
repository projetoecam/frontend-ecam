import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lideranca, LiderancaService } from '../../../../../core/services/lideranca.service';
import { FichaService, Pessoa } from '../../../../../core/services/ficha.service';

@Component({
  selector: 'app-lideranca-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lideranca-cadastro.component.html',
  styleUrls: ['./lideranca-cadastro.component.css'],
})
export class LiderancaCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  liderancas: Lideranca[] = [];
  liderancasFiltradas: Lideranca[] = [];
  pessoas: Pessoa[] = [];

  formularioAberto = false;
  liderancaEdicao: Partial<Lideranca> = {};
  pessoaSelecionadaId: number | '' = '';

  searchTerm = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  carregandoPessoas = false;

  constructor(
    private liderancaService: LiderancaService,
    private fichaService: FichaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.carregarPessoas();
    this.carregarLiderancas();
  }

  carregarPessoas(): void {
    this.carregandoPessoas = true;
    this.cdr.detectChanges();

    this.fichaService.obterTodos().subscribe({
      next: (pessoas) => {
        this.pessoas = pessoas;
        this.carregandoPessoas = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de pessoas. ' + erro.message, 'erro');
        this.carregandoPessoas = false;
        this.cdr.detectChanges();
      },
    });
  }

  carregarLiderancas(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.liderancaService.obterTodos().subscribe({
      next: (liderancas) => {
        this.liderancas = liderancas;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de lideranÃ§as. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  getIdLideranca(item: Lideranca): number | undefined {
    return item.id ?? item.idPessoa ?? item.pessoa?.id;
  }

  getPessoaNome(item: Lideranca): string {
    const idPessoa = this.getIdLideranca(item);
    if (!idPessoa) return item.pessoa?.nomeCompleto || '-';

    const pessoa = this.pessoas.find((p) => p.id === idPessoa);
    return pessoa?.nomeCompleto || item.pessoa?.nomeCompleto || '-';
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.liderancasFiltradas = [...this.liderancas];
    } else {
      this.liderancasFiltradas = this.liderancas.filter((item) => {
        const nomePessoa = this.getPessoaNome(item).toLowerCase();
        return (
          nomePessoa.includes(termo) ||
          item.tipoLideranca?.toLowerCase().includes(termo) ||
          item.classificacao?.toLowerCase().includes(termo) ||
          String(item.qtdPessoasMobiliza ?? '').includes(termo) ||
          item.historicoPolitico?.toLowerCase().includes(termo)
        );
      });
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(lideranca?: Lideranca): void {
    if (lideranca) {
      const idPessoa = this.getIdLideranca(lideranca);
      this.liderancaEdicao = { ...lideranca };
      this.pessoaSelecionadaId = idPessoa ?? '';
    } else {
      this.liderancaEdicao = {
        tipoLideranca: '',
        classificacao: '',
        qtdPessoasMobiliza: null,
        historicoPolitico: '',
      };
      this.pessoaSelecionadaId = '';
    }

    this.formularioAberto = true;
  }

  get emEdicao(): boolean {
    return !!this.getIdLideranca(this.liderancaEdicao as Lideranca);
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.liderancaEdicao = {};
    this.pessoaSelecionadaId = '';
  }

  salvar(): void {
    if (!this.pessoaSelecionadaId || !this.liderancaEdicao.tipoLideranca?.trim() || !this.liderancaEdicao.classificacao?.trim()) {
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const idPessoa = Number(this.pessoaSelecionadaId);
    const valorQtd = this.liderancaEdicao.qtdPessoasMobiliza;
    const qtdMobiliza = valorQtd === null || valorQtd === undefined ? null : Number(valorQtd);

    const payload: Lideranca = {
      id: idPessoa,
      idPessoa,
      tipoLideranca: this.liderancaEdicao.tipoLideranca.trim(),
      classificacao: this.liderancaEdicao.classificacao.trim(),
      qtdPessoasMobiliza: Number.isNaN(qtdMobiliza) ? null : qtdMobiliza,
      historicoPolitico: this.liderancaEdicao.historicoPolitico?.trim() || '',
    };

    const idEdicao = this.getIdLideranca(this.liderancaEdicao as Lideranca);

    if (idEdicao) {
      this.liderancaService.atualizar(idEdicao, payload).subscribe({
        next: () => {
          this.exibirMensagem('LideranÃ§a atualizada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarLiderancas();
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.liderancaService.criar(payload).subscribe({
        next: () => {
          this.exibirMensagem('LideranÃ§a cadastrada com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarLiderancas();
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
    const idParaDeletar = typeof alvo === 'number' ? alvo : this.getIdLideranca(alvo);

    if (!idParaDeletar) {
      this.exibirMensagem('Erro: nÃ£o foi possÃ­vel identificar o ID da lideranÃ§a.', 'erro');
      return;
    }

    const nomePessoa = this.getPessoaNome(alvo);
    const confirmacao = window.confirm(
      `AtenÃ§Ã£o: tem certeza que deseja excluir a lideranÃ§a de ${nomePessoa}? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`,
    );

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.liderancaService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarLiderancas();
        this.carregandoDeletar = false;
        this.exibirMensagem('LideranÃ§a excluÃ­da com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir lideranÃ§a. ' + erro.message, 'erro');
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


