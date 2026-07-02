# Integração de API - Municipios

## Visão Geral

O componente de Cadastro de Municipios foi configurado para se conectar a uma API REST. Este documento descreve o que precisa ser implementado no lado do backend.

## URL da API

A aplicação espera a API em: `http://localhost:8080/api/municipios`

Você pode alterar isso em: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'  // Altere conforme necessário
};
```

## Endpoints Necessários

O serviço `MunicipioService` faz chamadas para os seguintes endpoints:

### 1. **GET /api/municipios**
Retorna lista de todos os municipios

**Resposta de Sucesso (200):**
```json
[
  {
    "id": 1,
    "nome": "São Paulo",
    "uf": "SP"
  },
  {
    "id": 2,
    "nome": "Rio de Janeiro",
    "uf": "RJ"
  }
]
```

### 2. **GET /api/municipios/{id}**
Retorna um municipio específico

**Parâmetros:**
- `id`: ID do municipio (integer)

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "São Paulo",
  "uf": "SP"
}
```

### 3. **POST /api/municipios**
Cria um novo municipio

**Body (JSON):**
```json
{
  "nome": "Novo Municipio",
  "uf": "SP"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 3,
  "nome": "Novo Municipio",
  "uf": "SP"
}
```

### 4. **PUT /api/municipios/{id}**
Atualiza um municipio existente

**Parâmetros:**
- `id`: ID do municipio (integer)

**Body (JSON):**
```json
{
  "nome": "Municipio Atualizado",
  "uf": "MG"
}
```

**Resposta de Sucesso (200):**
```json
{
  "id": 1,
  "nome": "Municipio Atualizado",
  "uf": "MG"
}
```

### 5. **DELETE /api/municipios/{id}**
Deleta um municipio

**Parâmetros:**
- `id`: ID do municipio (integer)

**Resposta de Sucesso (204):**
Sem corpo de resposta

## Estrutura do Municipio no Backend

O modelo de dados deve conter:

```java
// Exemplo em Java/Spring Boot
@Entity
public class Municipio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(nullable = false, length = 100)
    private String nome;
    
    @Column(nullable = false, length = 2)
    private String uf;
}
```

## Campos Obrigatórios

- `id`: Integer (auto-incremento) - **Gerado pelo backend**
- `nome`: String (máx 100 caracteres) - **Obrigatório**
- `uf`: String (2 caracteres) - **Obrigatório**

## Validações Esperadas

O backend deve validar:

1. **Nome**: Não vazio, máximo 100 caracteres
2. **UF**: Código de estado válido (2 caracteres)

Exemplo de códigos de UF válidos:
```
AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG, 
PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO
```

## Tratamento de Erros

O cliente espera erros com a seguinte estrutura:

**Resposta de Erro (4xx/5xx):**
```json
{
  "mensagem": "Descrição do erro"
}
```

Ou o campo `message` será usado se `mensagem` não existir.

## CORS

A API deve permitir requisições CORS da origem frontend:
- `http://localhost:4200` (desenvolvimento)
- Adicione outras origens conforme necessário

## Exemplo de Implementação (Spring Boot)

```java
@RestController
@RequestMapping("/api/municipios")
@CrossOrigin(origins = "http://localhost:4200")
public class MunicipioController {
    
    @Autowired
    private MunicipioService service;
    
    @GetMapping
    public ResponseEntity<List<Municipio>> obterTodos() {
        return ResponseEntity.ok(service.obterTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Municipio> obterPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obterPorId(id));
    }
    
    @PostMapping
    public ResponseEntity<Municipio> criar(@RequestBody Municipio municipio) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.criar(municipio));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Municipio> atualizar(
        @PathVariable Integer id,
        @RequestBody Municipio municipio
    ) {
        return ResponseEntity.ok(service.atualizar(id, municipio));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
```

## Configuração no Frontend

Para iniciar o frontend:

```bash
npm install
npm start
```

A aplicação estará disponível em: `http://localhost:4200`

## Testes

Para testar a integração, você pode usar ferramentas como:
- Postman
- Insomnia
- cURL
- VS Code REST Client

Exemplo com cURL:

```bash
# Listar todos
curl http://localhost:8080/api/municipios

# Criar novo
curl -X POST http://localhost:8080/api/municipios \
  -H "Content-Type: application/json" \
  -d '{"nome":"São Paulo","uf":"SP"}'

# Atualizar
curl -X PUT http://localhost:8080/api/municipios/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"São Paulo Atualizado","uf":"SP"}'

# Deletar
curl -X DELETE http://localhost:8080/api/municipios/1
```

## Status de Carregamento

O frontend mostra indicadores de carregamento:
- "⏳ Carregando municipios..." ao buscar a lista
- "⏳ Salvando..." ao salvar/atualizar
- "⏳" no botão deletar durante o processo

Esses estados ajudam a fornecer feedback ao usuário durante operações assíncronas.
