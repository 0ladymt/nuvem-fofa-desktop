NUVEM FOFA DESKTOP 0.3.0

Principais correções desta versão:
- ícones próprios em SVG, sem emojis na interface;
- clique no canal de voz abre a chamada;
- painel inferior de voz com microfone, transmissão, desativar áudio e desconectar;
- desativar áudio muta microfone + áudio recebido;
- volume individual da transmissão;
- transmissão preparada para até 1080p/60fps e áudio do sistema quando disponível;
- supressão de ruído reforçada com WebRTC + processamento local;
- tema claro com contraste adaptável;
- mensagens diretas com perfil da outra pessoa na lateral direita;
- imagens e vídeos abrem em visualizador grande;
- botão direito em imagens/vídeos oferece salvar e abrir maior;
- foto do servidor e capa do servidor corrigidas;
- opção de sair do servidor;
- ícone do aplicativo Windows alterado para a nuvem da Nuvem Fofa;
- auto-update preparado com GitHub Releases.

AUTO-UPDATE
1. Crie um repositório público chamado nuvem-fofa-desktop no GitHub.
2. Altere SEU-USUARIO no package.json para o usuário real.
3. Faça push do projeto.
4. Publique tags v0.3.0, v0.3.1, v0.4.0 etc.
5. O workflow .github/workflows/release.yml gera e publica o instalador.
6. Os clientes instalados procuram e baixam a atualização automaticamente.

Consulte README-GITHUB-PASSO-A-PASSO.md para o passo a passo completo.
