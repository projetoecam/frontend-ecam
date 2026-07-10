import { Component, ChangeDetectorRef, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Segmento, SegmentoService } from '../../../../../core/services/segmento.service';
import { OperationFeedbackService } from '../../../../../shared/services/operation-feedback.service';
import { OperationConfirmService } from '../../../../../shared/services/operation-confirm.service';

@Component({
  selector: 'app-segmento-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './segmento-cadastro.component.html',
  styleUrls: ['./segmento-cadastro.component.css'],
})
export class SegmentoCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  segmentos: Segmento[] = [];
  segmentosFiltrados: Segmento[] = [];
  segmentoEdicao: Partial<Segmento> = {};

  searchTerm = '';
  formularioAberto = false;
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;

  constructor(
    private segmentoService: SegmentoService,
    private cdr: ChangeDetectorRef,
    private operationFeedback: OperationFeedbackService,
    private operationConfirm: OperationConfirmService,
  ) {}

  ngOnInit(): void {
    this.carregarSegmentos();
  }

  carregarSegmentos(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.segmentoService.obterTodos().subscribe({
      next: (segmentos) => {
        this.segmentos = segmentos;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de segmentos. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.segmentosFiltrados = [...this.segmentos];
    } else {
      this.segmentosFiltrados = this.segmentos.filter((item) =>
        item.nome?.toLowerCase().includes(termo),
      );
    }

    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(segmento?: Segmento): void {
    if (segmento) {
      this.segmentoEdicao = { ...segmento };
    } else {
      this.segmentoEdicao = { nome: '' };
    }

    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.segmentoEdicao = {};
  }

  salvar(): void {
    if (!this.segmentoEdicao.nome?.trim()) {
      this.exibirMensagem('Preencha o nome do segmento.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    const payload: Segmento = {
      id: this.segmentoEdicao.id,
      nome: this.segmentoEdicao.nome.trim(),
    };

    if (payload.id) {
      this.segmentoService.atualizar(payload.id, payload).subscribe({
        next: () => {
          this.exibirMensagem('Segmento atualizado com sucesso.', 'sucesso', () => {
            this.fecharFormulario();
            this.carregarSegmentos();
          });
          this.carregandoSalvar = false;
        },
        error: (erro) => {
          this.exibirMensagem('Erro ao atualizar. ' + erro.message, 'erro');
          this.carregandoSalvar = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.segmentoService.criar(payload).subscribe({
        next: () => {
          this.exibirMensagem('Segmento cadastrado com sucesso.', 'sucesso', () => {
            this.fecharFormulario();
            this.carregarSegmentos();
          });
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

  async deletar(alvo: any): Promise<void> {
    const idParaDeletar = typeof alvo === 'number' ? alvo : alvo?.id;

    if (!idParaDeletar) {
      this.exibirMensagem('Erro: não foi possível identificar o ID do segmento.', 'erro');
      return;
    }

    const nomeSegmento = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este segmento';
    const confirmacao = await this.operationConfirm.confirm({
      title: 'Excluir segmento',
      message: `Tem certeza que deseja excluir ${nomeSegmento}? Esta ação não poderá ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Voltar',
    });

    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.segmentoService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarSegmentos();
        this.carregandoDeletar = false;
        this.exibirMensagem('Segmento excluído com sucesso.', 'sucesso');
      },
      error: (erro) => {
        this.exibirMensagem('Erro ao excluir segmento. ' + erro.message, 'erro');
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

  fecharPainel(): void {
    this.voltar.emit();
  }
}



