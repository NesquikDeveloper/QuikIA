# MC Bots (Node.js)

Sistema de bots para Minecraft focado em praticidade: tudo em um único arquivo `app.js`, com servidores, atividades e configuração em arquivos `.txt`.

Autor: nesquikdeveloper • Licença: MIT • Open-source

## Requisitos
- Node.js 16+ (recomendado 18+)
- Acesso a um servidor compatível com a versão 1.8

## Instalação
1. Baixe/clon e este projeto.
2. Instale dependências:

```bash
npm install
```

Se o PowerShell bloquear o npm por política de execução, execute em “Prompt de Comando (cmd)” ou ajuste a política:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Como usar
1. Edite os arquivos de configuração:
   - [servers.txt](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/servers.txt)
   - [atividades.txt](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/atividades.txt)
   - [config.txt](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/config.txt)
2. Inicie:

```bash
npm start
```

## Estrutura de arquivos
- [app.js](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/app.js): lógica dos bots (criação, eventos, execução de atividades).
- [servers.txt](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/servers.txt): lista de servidores `IP:PORTA`, um por linha. Comentários após `#` são ignorados.
- [atividades.txt](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/atividades.txt): uma atividade por linha em JSON.
- [config.txt](file:///c:/Users/Douglas/Documents/trae_projects/quikIA/config.txt): JSON de configuração geral (quantidade de bots, versão, nomes, etc.).

## Formato de servers.txt
Cada linha:
```
IP:PORTA # comentário opcional
```
Exemplo:
```
127.0.0.1:25565 # servidor local
```

## Formato de atividades.txt (JSON por linha)
Cada linha é um objeto com a atividade. Campos suportados:
- `type`: tipo da ação (`register_on_join`, `command`, `menu_select`, `walk`)
- `trigger`: quando executar (`on_join`, `on_window_open`)
- `delay`: atraso em ms após o trigger
- `afterMs`: atraso absoluto desde o início do bot
- `text`: comando para `type:"command"`
- `item`/`itemId`: identificação do item para `menu_select` (ex.: `"stained_hardened_clay"` ou `"159/13"`)
- `durationMs`: tempo de movimento para `walk`

Exemplos:
```json
{"type":"menu_select","itemId":"159/13","trigger":"on_window_open","delay":0}
{"type":"command","text":"/register 123456 123456","trigger":"on_join","delay":3000}
{"type":"walk","durationMs":1500,"afterMs":8000}
```

## Formato de config.txt (JSON)
Campos disponíveis:
- `bots`: quantidade de bots por servidor
- `version`: versão do protocolo, ex.: `"1.8"` (já configurado)
- `registerPassword`: senha para `/register senha senha`
- `namePrefixes`: lista de prefixos para nomes “legit”
  - Cada item: `{ "value": "texto", "position": "start" | "end" }`
- `baseName`: base de nome (opcional) para compor os nicks

Exemplo:
```json
{
  "bots": 2,
  "version": "1.8",
  "registerPassword": "123456",
  "namePrefixes": [
    { "value": "chorapro", "position": "start" },
    { "value": "BW", "position": "end" },
    { "value": "luizin", "position": "start" }
  ],
  "baseName": "Legit"
}
```

## O que os bots fazem
- Ao entrar (`spawn`), executam `/register senha senha` dentro de ~5s (se configurado).
- Executam atividades de `atividades.txt` conforme `trigger`, `delay` e `afterMs`.
- Em menus (inventário/janela aberta), o `menu_select` procura pelo item e clica.
- `walk` aciona movimento simples (frente) por `durationMs`.

## Observações
- Versão: definida como `"1.8"` em `config.txt`. Acione `"1.8.9"` se seu servidor exigir.
- Autenticação: servidores offline-mode costumam usar `/register` e `/login`. Em online-mode, isso não se aplica.
- Nomes “legit”: combinamos `baseName` com `namePrefixes`. `position:"start"` adiciona no início; `position:"end"` adiciona no final.

## Ética e conformidade
Use sempre em conformidade com as regras do servidor e leis aplicáveis. Não utilize para prejudicar terceiros.

## Licença
MIT — Open-source. Veja `package.json` e mantenha os créditos: by nesquikdeveloper.
