import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MunicipioService, Municipio } from '../../../core/services/municipio.service';

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
  municipioEdicao: Municipio = { nome: '', uf: '' };
  municipioSelecionado: Municipio | null = null;
  searchTerm = '';
  mensagem = '';
  tipoMensagem: 'sucesso' | 'erro' = 'sucesso';
  modalSucessoAberto = false;
  
  // Estados de carregamento
  carregandoLista = false;
  carregandoSalvar = false;
  carregandoDeletar = false;
  
  estadosBrasileiros = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  constructor(private municipioService: MunicipioService) {}

  ngOnInit() {
    this.municipioService.municipios$.subscribe(municipios => {
      this.municipios = municipios;
      this.filtrar();
    });

    this.carregarMunicipios();
  }

  carregarMunicipios() {
    this.carregandoLista = true;
    this.municipioService.obterTodos().subscribe(
      municipios => {
        this.municipios = municipios;
        this.filtrar();
        this.carregandoLista = false;
      },
      erro => {
        this.mostrarMensagem('Erro ao carregar municipios: ' + erro.message, 'erro');
        this.carregandoLista = false;
      }
    );
  }

  filtrar() {
    if (!this.searchTerm) {
      this.municipiosFiltrados = [...this.municipios];
    } else {
      this.municipiosFiltrados = this.municipios.filter(m =>
        m.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        m.uf.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  onSearchChange() {
    this.filtrar();
  }

  abrirFormulario(municipio?: Municipio) {
    if (municipio) {
      this.municipioEdicao = { ...municipio };
    } else {
      this.municipioEdicao = { nome: '', uf: '' };
    }
    this.formularioAberto = true;
  }

  fecharFormulario() {
    this.formularioAberto = false;
    this.municipioEdicao = { nome: '', uf: '' };
  }

  limparFormulario() {
    this.municipioEdicao = { nome: '', uf: '' };
  }

  private mostrarSucessoSalvo() {
    this.modalSucessoAberto = true;
    setTimeout(() => {
      this.modalSucessoAberto = false;
    }, 1000);
  }

  private finalizarSalvarComSucesso() {
    this.mostrarSucessoSalvo();
    this.limparFormulario();
    this.formularioAberto = true;
    this.municipioSelecionado = null;
    this.carregarMunicipios();
  }

  salvar() {
    if (!this.municipioEdicao.nome || !this.municipioEdicao.uf) {
      this.mostrarMensagem('Preencha todos os campos', 'erro');
      return;
    }

    const nomeNormalizado = this.municipioEdicao.nome.trim();
    const ufNormalizada = this.municipioEdicao.uf.trim().toUpperCase();

    if (!nomeNormalizado || !ufNormalizada) {
      this.mostrarMensagem('Preencha todos os campos', 'erro');
      return;
    }

    const listaMunicipios = Array.isArray(this.municipios) ? this.municipios : [];

    const jaExiste = listaMunicipios.some(m =>
      m.id !== this.municipioEdicao.id &&
      m.nome.trim().toLowerCase() === nomeNormalizado.toLowerCase() &&
      m.uf.trim().toUpperCase() === ufNormalizada
    );

    if (jaExiste) {
      this.mostrarMensagem('Este município já está cadastrado para a UF informada', 'erro');
      return;
    }

    this.municipioEdicao = {
      ...this.municipioEdicao,
      nome: nomeNormalizado,
      uf: ufNormalizada
    };

    if (this.municipioEdicao.id) {
      // Atualizar
      this.municipioService.atualizar(this.municipioEdicao.id, this.municipioEdicao).subscribe(
        () => {
          this.finalizarSalvarComSucesso();
        },
        erro => {
          this.mostrarMensagem('Erro ao atualizar: ' + erro.message, 'erro');
        }
      );
    } else {
      // Criar novo
      this.municipioService.criar(this.municipioEdicao).subscribe(
        () => {
          this.finalizarSalvarComSucesso();
        },
        erro => {
          this.mostrarMensagem('Erro ao criar: ' + erro.message, 'erro');
        }
      );
    }
  }

  deletar(id?: number) {
    if (!id) return;

    if (!confirm('Deseja realmente deletar este municipio?')) {
      return;
    }

    this.carregandoDeletar = true;
    this.municipioService.deletar(id).subscribe(
      () => {
        this.mostrarMensagem('Municipio deletado com sucesso', 'sucesso');
        this.carregarMunicipios();
        this.municipioSelecionado = null;
        this.carregandoDeletar = false;
      },
      erro => {
        this.mostrarMensagem('Erro ao deletar: ' + erro.message, 'erro');
        this.carregandoDeletar = false;
      }
    );
  }

  selecionarMunicipio(municipio: Municipio) {
    this.municipioSelecionado = municipio;
  }

  mostrarMensagem(texto: string, tipo: 'sucesso' | 'erro') {
    this.mensagem = texto;
    this.tipoMensagem = tipo;
    setTimeout(() => {
      this.mensagem = '';
    }, 3000);
  }

  fecharPainel() {
    this.voltar.emit();
  }
}