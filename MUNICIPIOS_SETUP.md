# Cadastro de Municipios - Documentação

## Estrutura Criada

### Arquivos Criados:

1. **[src/app/core/services/municipio.service.ts](src/app/core/services/municipio.service.ts)**
   - Serviço para comunicação com a API Backend
   - Métodos: listar(), obterPorId(), criar(), atualizar(), deletar()
   - URL Base: `http://localhost:8080/api/municipios`

2. **[src/app/pages/home/components/municipio-cadastro.component.ts](src/app/pages/home/components/municipio-cadastro.component.ts)**
   - Componente standalone com CRUD completo
   - Funcionalidades: Listar, Criar, Editar, Deletar, Buscar

3. **[src/app/pages/home/components/municipio-cadastro.component.html](src/app/pages/home/components/municipio-cadastro.component.html)**
   - Template do componente com UI responsiva
   - Painel deslizante (drawer) no lado direito

4. **[src/app/pages/home/components/municipio-cadastro.component.css](src/app/pages/home/components/municipio-cadastro.component.css)**
   - Estilos adicionais do componente

### Alterações em Arquivos Existentes:

1. **[src/app/pages/home/home.component.ts](src/app/pages/home/home.component.ts)**
   - Adicionado: `HttpClientModule`, `MunicipipoCadastroComponent`
   - Adicionado: propriedade `isMunicipiosOpen`
   - Adicionado: método `abrirMunicipios()`

2. **[src/app/pages/home/home.component.html](src/app/pages/home/home.component.html)**
   - Alterado botão de "Municipios" para chamar `abrirMunicipios()`
   - Adicionada seção resumida de municipios no painel
   - Adicionado componente `app-municipio-cadastro`

## Como Usar

### 1. Backend Spring Boot

O projeto espera uma API REST em `http://localhost:8080/api/municipios` com endpoints:

- `GET /api/municipios` - Listar todos
- `GET /api/municipios/{id}` - Obter por ID
- `POST /api/municipios` - Criar novo
- `PUT /api/municipios/{id}` - Atualizar
- `DELETE /api/municipios/{id}` - Deletar

**Model esperado:**
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Integer id;

@Column(nullable = false, length = 100)
private String nome;

@Column(length = 2)
private String uf;
```

### 2. Frontend

Ao clicar em **"Municipios"** no menu de Cadastros:
- Um painel deslizante abre no lado direito
- Mostra lista de municipios com busca
- Permite criar novo municipio
- Ao clicar em um municipio, mostra botões Editar e Deletar
- Formulário com validação de campos obrigatórios
- Seleção de UF via dropdown com todos os estados brasileiros

### 3. Funcionalidades

✅ **Listar:** Todos os municipios são carregados ao abrir o painel  
✅ **Buscar:** Campo de busca filtra por nome ou UF em tempo real  
✅ **Criar:** Botão "+ Novo Municipio" abre formulário  
✅ **Editar:** Clique em um item + botão "Editar"  
✅ **Deletar:** Clique em um item + botão "Deletar" (com confirmação)  
✅ **Feedback:** Mensagens de sucesso/erro aparecem na parte superior  

## Instalação da Dependência (se necessário)

O projeto já possui as dependências necessárias no `package.json`:
- `@angular/common` - CommonModule
- `@angular/forms` - FormsModule (para ngModel)
- `@angular/platform-browser` - HttpClientModule

## Observações

- O componente usa **TailwindCSS** para estilização
- Interface responsiva funciona em mobile e desktop
- Validações simples de campos obrigatórios
- Integração automática com HttpClientModule do Angular
- Suporta todos os 27 estados brasileiros (AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO)

## Próximos Passos

1. Configure a API Backend em Spring Boot
2. Teste com o servidor rodando em `localhost:8080`
3. Personalize cores/estilos conforme necessário
4. Adicione validações adicionais se necessário
