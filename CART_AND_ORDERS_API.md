# API de Carrinho e Pedidos

## Autenticação
Todas as rotas requerem autenticação JWT. Inclua o token no header:
```
Authorization: Bearer <seu_token_jwt>
```

## Carrinho (Cart)

### Base URL: `/cart`

#### 1. Obter Carrinho
```http
GET /cart
```
**Permissão:** CUSTOMER

**Resposta:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "items": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "Nome do Produto",
      "productPrice": 29.99,
      "productImage": "url_da_imagem",
      "quantity": 2,
      "subtotal": 59.98
    }
  ],
  "total": 59.98,
  "itemCount": 2,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 2. Adicionar Produto ao Carrinho
```http
POST /cart/add
```
**Permissão:** CUSTOMER

**Body:**
```json
{
  "productId": "uuid",
  "quantity": 2
}
```

#### 3. Atualizar Quantidade do Item
```http
PUT /cart/items/:itemId
```
**Permissão:** CUSTOMER

**Body:**
```json
{
  "quantity": 3
}
```

#### 4. Remover Item do Carrinho
```http
DELETE /cart/items/:itemId
```
**Permissão:** CUSTOMER

#### 5. Limpar Carrinho
```http
DELETE /cart/clear
```
**Permissão:** CUSTOMER

## Endereços (Addresses)

### Base URL: `/addresses`

#### 1. Criar Endereço
```http
POST /addresses
```
**Permissão:** CUSTOMER

**Body:**
```json
{
  "street": "Rua das Flores",
  "number": "123",
  "complement": "Apto 45",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}
```

#### 2. Listar Endereços
```http
GET /addresses
```
**Permissão:** CUSTOMER

#### 3. Obter Endereço por ID
```http
GET /addresses/:id
```
**Permissão:** CUSTOMER

#### 4. Atualizar Endereço
```http
PUT /addresses/:id
```
**Permissão:** CUSTOMER

#### 5. Deletar Endereço
```http
DELETE /addresses/:id
```
**Permissão:** CUSTOMER

## Pedidos (Orders)

### Base URL: `/orders`

#### 1. Criar Pedido
```http
POST /orders
```
**Permissão:** CUSTOMER

**Body:**
```json
{
  "addressId": "uuid",
  "paymentMethod": "CREDIT_CARD"
}
```

**Métodos de Pagamento Disponíveis:**
- `CREDIT_CARD`
- `DEBIT_CARD`
- `PIX`
- `BANK_SLIP`

#### 2. Listar Pedidos do Usuário
```http
GET /orders?page=1&limit=10&status=PENDING
```
**Permissão:** CUSTOMER

**Query Parameters:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `status` (opcional): Filtrar por status

**Status Disponíveis:**
- `PENDING`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

#### 3. Obter Pedido por ID
```http
GET /orders/:id
```
**Permissão:** CUSTOMER

#### 4. Atualizar Status do Pedido (Cliente)
```http
PUT /orders/:id/status
```
**Permissão:** CUSTOMER

**Body:**
```json
{
  "status": "CANCELLED"
}
```

#### 5. Cancelar Pedido
```http
PUT /orders/:id/cancel
```
**Permissão:** CUSTOMER

**Nota:** Apenas pedidos com status `PENDING` podem ser cancelados.

## Rotas de Administrador

### 1. Listar Todos os Pedidos (Admin)
```http
GET /orders/admin/all?page=1&limit=10&status=PENDING
```
**Permissão:** ADMIN

### 2. Atualizar Status do Pedido (Admin)
```http
PUT /orders/admin/:id/status
```
**Permissão:** ADMIN

**Body:**
```json
{
  "status": "PROCESSING"
}
```

## Fluxo de Compra

1. **Adicionar produtos ao carrinho:**
   ```http
   POST /cart/add
   ```

2. **Verificar carrinho:**
   ```http
   GET /cart
   ```

3. **Criar endereço (se necessário):**
   ```http
   POST /addresses
   ```

4. **Criar pedido:**
   ```http
   POST /orders
   ```

5. **Acompanhar pedido:**
   ```http
   GET /orders/:id
   ```

## Exemplos de Uso

### Exemplo 1: Adicionar produto ao carrinho
```bash
curl -X POST http://localhost:3000/cart/add \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "uuid-do-produto",
    "quantity": 2
  }'
```

### Exemplo 2: Criar pedido
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer <seu_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "uuid-do-endereco",
    "paymentMethod": "PIX"
  }'
```

### Exemplo 3: Listar pedidos
```bash
curl -X GET "http://localhost:3000/orders?page=1&limit=5&status=PENDING" \
  -H "Authorization: Bearer <seu_token>"
```

## Códigos de Erro

- `400 Bad Request`: Dados inválidos ou carrinho vazio
- `401 Unauthorized`: Token JWT inválido ou ausente
- `403 Forbidden`: Permissão insuficiente
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito de dados (ex: status inválido) 