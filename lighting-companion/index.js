const WebSocket = require('ws');
const { keyboard, Key } = require('@nut-tree/nut-js');

const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

console.log('');
console.log('╔════════════════════════════════════════════════════╗');
console.log('║         🎭 LIGHTING COMPANION - Cupid Game         ║');
console.log('╠════════════════════════════════════════════════════╣');
console.log(`║  Serveur démarré sur le port ${PORT}                    ║`);
console.log('║                                                    ║');
console.log('║  Touches configurées:                              ║');
console.log('║    V = Vert (bonne réponse)                        ║');
console.log('║    R = Rouge (mauvaise réponse)                    ║');
console.log('║                                                    ║');
console.log('║  En attente de connexion de la page Admin...      ║');
console.log('╚════════════════════════════════════════════════════╝');
console.log('');

wss.on('connection', (ws) => {
  console.log('✅ Connexion établie avec la page Admin');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      if (data.type === 'GREEN') {
        console.log('🟢 Signal VERT reçu - Appui touche V');
        await keyboard.type(Key.V);
      } else if (data.type === 'RED') {
        console.log('🔴 Signal ROUGE reçu - Appui touche R');
        await keyboard.type(Key.R);
      }
    } catch (e) {
      console.error('Erreur parsing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('❌ Connexion fermée avec la page Admin');
  });

  ws.on('error', (error) => {
    console.error('Erreur WebSocket:', error);
  });
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n👋 Arrêt du serveur...');
  wss.close(() => {
    process.exit(0);
  });
});
