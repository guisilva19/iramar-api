# Códigos de Erro - Explicação Detalhada

## 🔒 Erro 403 Forbidden

### Quando ocorre o erro 403 na rota `GET /cart`?

O erro **403 Forbidden** na rota `GET /cart` (e em todas as outras rotas do carrinho) ocorre quando:

#### 1. **Usuário com Role ADMIN tenta acessar**
```typescript
// No controller do carrinho
@Roles(Role.CUSTOMER) // ← Apenas CUSTOMER pode acessar
export class CartController {
  @Get()
  async getCart(@Request() req): Promise<CartResponseDto> {
    // ...
  }
}
```

**Exemplo prático:**
- Usuário logado tem `role: "ADMIN"`
- Tenta acessar `GET /cart`
- **Resultado:** `403 Forbidden` - "Usuário não tem permissão"

#### 2. **Como o sistema verifica as permissões:**

```typescript
// RolesGuard verifica se o usuário tem a role necessária
canActivate(context: ExecutionContext): boolean {
  const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
    context.getHandler(),
    context.getClass(),
  ]);

  const { user } = context.switchToHttp().getRequest();
  return requiredRoles.some((role) => user?.role === role);
}
```

### Fluxo de Verificação:

1. **JwtAuthGuard** verifica se o token é válido
2. **JwtStrategy** extrai o usuário do token
3. **RolesGuard** verifica se o usuário tem a role necessária
4. Se não tiver a role correta → **403 Forbidden**

### Exemplos de Cenários:

#### ✅ **Sucesso (200 OK):**
```json
// Usuário logado com role CUSTOMER
{
  "id": "user-123",
  "email": "cliente@email.com",
  "role": "CUSTOMER"  // ← Role correta
}
```

#### ❌ **Erro 403 Forbidden:**
```json
// Usuário logado com role ADMIN
{
  "id": "user-456",
  "email": "admin@email.com",
  "role": "ADMIN"  // ← Role incorreta para carrinho
}
```

## 🔐 Erro 401 Unauthorized

### Quando ocorre o erro 401?

#### 1. **Token JWT ausente**
```bash
curl -X GET http://localhost:8000/cart
# Sem header Authorization
```

#### 2. **Token JWT inválido**
```bash
curl -X GET http://localhost:8000/cart \
  -H "Authorization: Bearer token_invalido"
```

#### 3. **Token JWT expirado**
```bash
curl -X GET http://localhost:8000/cart \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📋 Resumo dos Códigos de Erro

| Código | Quando Ocorre | Exemplo |
|--------|---------------|---------|
| **200** | Sucesso | Usuário CUSTOMER acessa carrinho |
| **201** | Criado | Produto adicionado ao carrinho |
| **400** | Dados inválidos | Quantity < 1 |
| **401** | Token inválido/ausente | Sem Authorization header |
| **403** | Sem permissão | ADMIN tentando acessar carrinho |
| **404** | Não encontrado | Produto inexistente |

## 🛠️ Como Testar

### Teste 1: Usuário CUSTOMER (Sucesso)
```bash
# 1. Faça login como CUSTOMER
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "cliente@email.com", "password": "123456"}'

# 2. Use o token retornado
curl -X GET http://localhost:8000/cart \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
# Resultado: 200 OK
```

### Teste 2: Usuário ADMIN (Erro 403)
```bash
# 1. Faça login como ADMIN
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@email.com", "password": "123456"}'

# 2. Use o token retornado
curl -X GET http://localhost:8000/cart \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
# Resultado: 403 Forbidden
```

### Teste 3: Sem Token (Erro 401)
```bash
curl -X GET http://localhost:8000/cart
# Resultado: 401 Unauthorized
```

## 🔧 Soluções

### Para ADMIN acessar carrinho:
1. **Criar usuário CUSTOMER** para testes
2. **Modificar a role** do usuário no banco
3. **Criar rota específica** para ADMIN (não recomendado)

### Para corrigir 401:
1. **Verificar se o token está sendo enviado**
2. **Verificar se o token não expirou**
3. **Verificar se o JWT_SECRET está correto**

### Para corrigir 403:
1. **Verificar a role do usuário** no banco de dados
2. **Usar usuário com role CUSTOMER** para rotas de carrinho
3. **Usar usuário com role ADMIN** para rotas administrativas 