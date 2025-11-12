# Guia de Testes - Sistema Life

## Como Testar as Melhorias Implementadas

### 1. Testar Retry Logic e Fallbacks

#### Cenário A: API da IA Indisponível
1. Desconecte a internet temporariamente
2. Tente criar uma nova meta
3. **Esperado**: Sistema deve mostrar mensagem de erro clara e usar fallback
4. **Verificar**: Meta é criada com valores padrão (progressão F->E->D)

#### Cenário B: Quota Excedida
1. Use a chave de API várias vezes até atingir o limite
2. Tente gerar uma nova missão diária
3. **Esperado**: Mensagem "Limite de uso da IA atingido. Tente novamente em alguns minutos."
4. **Verificar**: Missão é gerada com nome genérico mas funcional

### 2. Testar Debounce de Persistência

#### Cenário: Múltiplas Atualizações Rápidas
1. Abra o DevTools do navegador → Network tab
2. Complete uma sub-tarefa de missão (incremento de 1)
3. Rapidamente complete mais incrementos
4. **Esperado**: Apenas 1 write no Firebase após 500ms da última ação
5. **Verificar**: Estado local é atualizado imediatamente

```javascript
// No console do navegador, verifique:
// Deve haver poucos writes mesmo com múltiplas ações
```

### 3. Testar Validação de Dados

#### Cenário: IA Retorna Dados Inválidos
Para testar, você precisaria simular uma resposta inválida da IA.

**Teste Manual**:
1. Crie uma meta complexa
2. Observe o console do navegador (F12)
3. **Verificar**: Não deve haver crashes, apenas fallbacks

### 4. Teste de Fluxo Completo

#### Criar Meta → Missões Épicas → Missões Diárias

**Passo a Passo**:

1. **Login**
   - Faça login com sua conta
   - Verifique se o perfil carrega corretamente

2. **Criar Meta**
   ```
   - Clique em "Metas"
   - Clique no botão "+" para nova meta
   - Digite: "Aprender React Avançado"
   - Siga o wizard SMART
   ```

3. **Verificar Geração de Missões Épicas**
   ```
   - Após salvar a meta, vá para "Missões"
   - Deve aparecer uma nova missão ranqueada (Rank F)
   - Verifique se tem uma missão diária disponível
   ```

4. **Completar Primeira Missão**
   ```
   - Clique na missão diária
   - Complete todas as sub-tarefas
   - Marque como concluída
   ```

5. **Verificar Geração da Próxima Missão**
   ```
   - Deve aparecer automaticamente uma nova missão diária
   - Verifique se é logicamente a continuação
   - Observe o indicador de "gerando..." se houver
   ```

### 5. Teste de Stress

#### Múltiplas Operações Simultâneas

```javascript
// No console do navegador:
// Teste criar várias metas rapidamente
for(let i = 0; i < 5; i++) {
  console.log('Criando meta', i);
  // Crie metas manualmente uma atrás da outra
}
```

**Verificar**:
- Todas as metas são criadas
- Não há travamentos
- Firebase não tem writes duplicados

### 6. Testes de Erro

#### A. Erro de Rede
1. Desabilite a internet
2. Tente qualquer operação
3. **Esperado**: Mensagem de erro clara, não crash

#### B. Sessão Expirada
1. Faça logout em outra aba
2. Tente completar uma missão nesta aba
3. **Esperado**: Redirecionamento para login

#### C. Dados Corrompidos
1. Abra DevTools → Application → IndexedDB/LocalStorage
2. Modifique um valor manualmente
3. Recarregue a página
4. **Esperado**: Sistema detecta e corrige ou usa fallback

### 7. Verificar Performance

#### Usar React DevTools Profiler

1. Instale React DevTools
2. Abra a aba Profiler
3. Faça uma operação (ex: completar missão)
4. **Verificar**:
   - Poucos re-renders
   - Tempo total < 100ms
   - Sem warning de "excessive re-renders"

### 8. Verificar Console do Navegador

**Não deve haver**:
- ❌ Erros não capturados
- ❌ Warnings de dependências do useEffect
- ❌ "Maximum update depth exceeded"

**Deve haver**:
- ✅ Logs informativos de retry (quando aplicável)
- ✅ Mensagens de fallback (quando IA falha)
- ✅ Confirmações de persistência

## Checklist de Teste Rápido

### Funcionalidade Básica
- [ ] Login funciona
- [ ] Criar meta funciona
- [ ] Meta gera missões épicas
- [ ] Missão diária é criada
- [ ] Completar missão funciona
- [ ] Nova missão é gerada automaticamente
- [ ] XP e fragmentos são creditados
- [ ] Nível aumenta quando apropriado

### Resiliência
- [ ] Sistema funciona sem internet (fallbacks)
- [ ] Quota excedida não trava o app
- [ ] Erros mostram mensagens claras
- [ ] Dados inválidos não causam crash

### Performance
- [ ] Múltiplas ações não causam múltiplos writes
- [ ] UI permanece responsiva
- [ ] Não há travamentos ou freezes
- [ ] Loading states são mostrados adequadamente

### Logs e Debug
- [ ] Console não tem erros críticos
- [ ] Warnings são mínimos ou esperados
- [ ] Retry attempts são logados
- [ ] Fallbacks são logados

## Problemas Conhecidos (Esperados)

1. **Primeira geração de missão pode demorar**: Normal, a IA precisa processar
2. **Fallback ocasional**: Se a IA estiver sobrecarregada, fallback é esperado
3. **Debounce visível**: Updates no Firebase aparecem com ~500ms de delay (proposital)

## Como Reportar Bugs

Se encontrar um bug, inclua:
1. Passos para reproduzir
2. Comportamento esperado vs atual
3. Screenshots ou video
4. Console do navegador (F12)
5. Network tab (se relevante)

## Teste de Aceitação Final

✅ **Passar nestes testes significa que as melhorias funcionam**:

1. Criar 3 metas diferentes com sucesso
2. Completar pelo menos 5 missões seguidas
3. Não ver nenhum erro crítico no console
4. Firebase não deve ter mais de 2x writes que ações de usuário
5. Sistema funciona mesmo com internet lenta/instável

---

**Última atualização**: 12 de Novembro de 2025
**Versão**: 1.0
