# Delivery Sem Taxa - Liberte seu Lucro

## 1. Objetivo e Finalidade
Landing page de alta conversão e diagnóstico financeiro para restaurantes e deliveries reduzirem custos de intermediação de aplicativos.

## 2. Tecnologias Utilizadas
- HTML5, CSS3, JavaScript Vanilla, Cloudflare Workers (API), Batch Scripting

## 3. Arquitetura e Estrutura de Diretórios
Frontend estático responsivo (`index.html`, `obrigado.html`, `css/`, `js/`) apoiado por uma API serverless na pasta `worker/` para captura e qualificação de leads.

## 4. Principais Arquivos e Responsabilidades
- `index.html`: Página principal com calculadora de economia e diagnóstico.
- `obrigado.html`: Página de confirmação de cadastro de restaurante.
- `worker/`: Backend serverless para persistência e envio de notificações.
- `deploy.bat`: Script de automação de publicação Cloudflare.
- `test_api.js`: Script de validação da API de leads.

## 5. Funcionalidades Identificadas
- Calculadora interativa de economia contra taxas de marketplaces (ex: iFood)
- Captura e validação de leads comerciais
- Integração com worker serverless na borda da Cloudflare
- Scripts utilitários de teste e publicação rápida

## 6. Como Compilar ou Executar
```bash
# Testar API localmente
node test_api.js
# Publicar com wrangler
cd worker && npx wrangler deploy
```

## 7. Estado Atual do Projeto
**Completo**

## 8. Pendências e Limitações Identificadas
Conectar envio automático de e-mails de boas-vindas com relatório diagnóstico em PDF.
