import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MunicipioService, Municipio } from '../../../../../core/services/municipio.service';
import { OperationFeedbackService } from '../../../../../shared/services/operation-feedback.service';
import { OperationConfirmService } from '../../../../../shared/services/operation-confirm.service';

@Component({
  selector: 'app-municipio-cadastro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './municipio-cadastro.component.html',
  styleUrls: ['./municipio-cadastro.component.css']
})
export class MunicipioCadastroComponent implements OnInit {
  @Output() voltar = new EventEmitter<void>();

  municipios: Municipio[] = [];
  municipiosFiltrados: Municipio[] = [];

  formularioAberto = false;
  municipioEdicao: Partial<Municipio> = {};
  searchTerm: string = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';

  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;

  estadosBrasileiros = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  constructor(
    private municipioService: MunicipioService,
    private cdr: ChangeDetectorRef,
    private operationFeedback: OperationFeedbackService,
    private operationConfirm: OperationConfirmService,
  ) {}

  ngOnInit(): void {
    this.carregarMunicipios();
  }

  carregarMunicipios(): void {
    this.carregandoLista = true;
    this.cdr.detectChanges();

    this.municipioService.obterTodos().subscribe({
      next: (municipios) => {
        this.municipios = municipios;
        this.filtrar();
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
      error: (erro) => {
        this.exibirMensagem('Falha ao carregar a lista de municípios. ' + erro.message, 'erro');
        this.carregandoLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrar(): void {
    const termo = this.searchTerm.toLowerCase().trim();

    if (!termo) {
      this.municipiosFiltrados = [...this.municipios];
    } else {
      this.municipiosFiltrados = this.municipios.filter((m) =>
        m.nome?.toLowerCase().includes(termo) ||
        m.uf?.toLowerCase().includes(termo)
      );
    }
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.filtrar();
  }

  abrirFormulario(municipio?: Municipio): void {
    if (municipio) {
      this.municipioEdicao = { ...municipio };
    } else {
      this.municipioEdicao = { nome: '', uf: '' };
    }
    this.formularioAberto = true;
  }

  fecharFormulario(): void {
    this.formularioAberto = false;
    this.municipioEdicao = {};
  }

  salvar(): void {
    if (!this.municipioEdicao.nome || !this.municipioEdicao.uf) {
      this.exibirMensagem('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const nomeNormalizado = this.municipioEdicao.nome.trim();
    const ufNormalizada = this.municipioEdicao.uf.trim().toUpperCase();

    if (!nomeNormalizado || !ufNormalizada) {
      this.exibirMensagem('Preencha os campos obrigatórios.', 'erro');
      return;
    }

    const listaMunicipios = Array.isArray(this.municipios) ? this.municipios : [];

    const jaExiste = listaMunicipios.some(m =>
      m.id !== this.municipioEdicao.id &&
      m.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase() &&
      m.uf.trim().toUpperCase() === ufNormalizada
    );

    if (jaExiste) {
      this.exibirMensagem('Este município já está cadastrado para a UF informada.', 'erro');
      return;
    }

    this.carregandoSalvar = true;
    this.cdr.detectChanges();

    this.municipioEdicao = {
      ...this.municipioEdicao,
      nome: nomeNormalizado,
      uf: ufNormalizada
    };

    if (this.municipioEdicao.id) {
      this.municipioService.atualizar(this.municipioEdicao.id, this.municipioEdicao as Municipio).subscribe({
        next: () => {
          this.exibirMensagem('Município atualizado com sucesso.', 'sucesso', () => {
            this.fecharFormulario();
            this.carregarMunicipios();
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
      this.municipioService.criar(this.municipioEdicao as Municipio).subscribe({
        next: () => {
          this.exibirMensagem('Município cadastrado com sucesso.', 'sucesso', () => {
            this.fecharFormulario();
            this.carregarMunicipios();
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
      this.exibirMensagem('Erro: não foi possível identificar o ID do município.', 'erro');
      return;
    }

    const nomeMunicipio = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este município';

    const confirmacao = await this.operationConfirm.confirm({
      title: 'Excluir município',
      message: `Tem certeza que deseja excluir ${nomeMunicipio}? Esta ação não poderá ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Voltar',
    });
    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.municipioService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarMunicipios();
        this.carregandoDeletar = false;
        this.exibirMensagem('Município excluído com sucesso.', 'sucesso');
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir município.', 'erro');
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


