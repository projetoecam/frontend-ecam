import { Component, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MunicipioService, Municipio } from '../../../../../core/services/municipio.service';

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
        this.exibirMensagem('Falha ao carregar a lista de municÃ­pios. ' + erro.message, 'erro');
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
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    const nomeNormalizado = this.municipioEdicao.nome.trim();
    const ufNormalizada = this.municipioEdicao.uf.trim().toUpperCase();

    if (!nomeNormalizado || !ufNormalizada) {
      this.exibirMensagem('Preencha os campos obrigatÃ³rios.', 'erro');
      return;
    }

    const listaMunicipios = Array.isArray(this.municipios) ? this.municipios : [];

    const jaExiste = listaMunicipios.some(m =>
      m.id !== this.municipioEdicao.id &&
      m.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase() &&
      m.uf.trim().toUpperCase() === ufNormalizada
    );

    if (jaExiste) {
      this.exibirMensagem('Este municÃ­pio jÃ¡ estÃ¡ cadastrado para a UF informada.', 'erro');
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
          this.exibirMensagem('MunicÃ­pio atualizado com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarMunicipios();
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
          this.exibirMensagem('MunicÃ­pio cadastrado com sucesso.', 'sucesso');
          this.fecharFormulario();
          this.carregarMunicipios();
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
      this.exibirMensagem('Erro: nÃ£o foi possÃ­vel identificar o ID do municÃ­pio.', 'erro');
      return;
    }

    const nomeMunicipio = typeof alvo === 'object' && alvo?.nome ? alvo.nome : 'este municÃ­pio';

    const confirmacao = window.confirm(
      `AtenÃ§Ã£o: tem certeza que deseja excluir ${nomeMunicipio}? Esta aÃ§Ã£o nÃ£o poderÃ¡ ser desfeita.`,
    );
    if (!confirmacao) return;

    this.carregandoDeletar = true;
    this.cdr.detectChanges();

    this.municipioService.deletar(idParaDeletar).subscribe({
      next: () => {
        this.carregarMunicipios();
        this.carregandoDeletar = false;
        this.exibirMensagem('MunicÃ­pio excluÃ­do com sucesso.', 'sucesso');
      },
      error: () => {
        this.exibirMensagem('Erro ao excluir municÃ­pio.', 'erro');
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

