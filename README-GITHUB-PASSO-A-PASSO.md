# Nuvem Fofa — GitHub + atualizações automáticas

## O que vamos usar

- GitHub para guardar o código.
- GitHub Releases para publicar cada versão do instalador.
- GitHub Actions para gerar o instalador automaticamente.
- `electron-updater` para o aplicativo procurar e baixar novas versões.

## 1. Criar a conta/repositório

1. Entre em https://github.com/
2. Faça login.
3. Clique em `+` no canto superior direito.
4. Clique em `New repository`.
5. Nome: `nuvem-fofa-desktop`.
6. Para a primeira configuração, deixe `Public`.
7. Não marque para criar README, .gitignore ou licença, porque estes arquivos já estão no projeto.
8. Clique em `Create repository`.

## 2. Descobrir seu usuário do GitHub

Na página do repositório, a URL ficará parecida com:

https://github.com/SEU-USUARIO/nuvem-fofa-desktop

O trecho `SEU-USUARIO` é o seu usuário do GitHub.

## 3. Configurar o package.json

Abra `package.json` e troque:

- `repository.url`
- `build.publish.owner`

O trecho `repo` deve continuar `nuvem-fofa-desktop`.

Exemplo:

`https://github.com/rafa/nuvem-fofa-desktop`

E:

`"owner": "rafa"`

## 4. Instalar Git no Windows

Se ainda não tiver Git, instale pelo site oficial:

https://git-scm.com/download/win

Depois abra o Prompt de Comando na pasta do projeto.

## 5. Primeiro envio para o GitHub

Execute:

```bat
git init
git branch -M main
git add .
git commit -m "Nuvem Fofa Desktop 0.3.0"
git remote add origin https://github.com/SEU-USUARIO/nuvem-fofa-desktop.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário.

## 6. Publicar uma versão

Quando o código estiver pronto:

```bat
git add .
git commit -m "Melhorias Nuvem Fofa"
git push
```

Depois crie uma tag de versão:

```bat
git tag v0.3.0
git push origin v0.3.0
```

O GitHub Actions será iniciado automaticamente e vai gerar o instalador Windows e publicar o Release.

## 7. Como as atualizações chegam aos usuários

O usuário instala uma versão normalmente uma única vez.

Depois, quando você publicar uma versão maior — por exemplo `v0.3.1` — o aplicativo instalado procura a nova versão, baixa os arquivos e mostra a opção `Reiniciar e atualizar`.

O usuário não precisa baixar o instalador manualmente novamente.

## 8. Regra de versões

Use versões crescentes:

- `0.3.0` → primeira versão pública desta linha
- `0.3.1` → correção
- `0.4.0` → novos recursos
- `1.0.0` → primeira versão estável

Nunca publique duas Releases diferentes com a mesma versão.

## 9. Importante

O repositório precisa estar público para que o aplicativo instalado consiga consultar as Releases do GitHub sem precisar guardar um token dentro do aplicativo.

O `GITHUB_TOKEN` usado pelo GitHub Actions serve para a automação publicar a Release. Ele não deve ser colocado dentro do aplicativo.
