const WebSocket = require('ws');
const { exec } = require('child_process');

const PORT = 3001;
const wss = new WebSocket.Server({ port: PORT });

function sendKey(key) {
  return new Promise((resolve, reject) => {
    const cmd = `powershell -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${key}')"`;
    exec(cmd, (error) => {
      if (error) {
        console.error('Erreur envoi touche:', error.message);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

console.log('');
console.log('========================================');
console.log('  LIGHTING COMPANION - Cupid Game');
console.log('========================================');
console.log(`  Serveur demarre sur le port ${PORT}`);
console.log('');
console.log('  Touches configurees:');
console.log('    V = Vert (bonne reponse)');
console.log('    R = Rouge (mauvaise reponse)');
console.log('    F = Finish (fin de partie, 10s)');
console.log('');
console.log('  En attente de connexion...');
console.log('========================================');
console.log('');

wss.on('connection', (ws) => {
  console.log('Connexion etablie avec la page Admin');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'GREEN') {
        console.log('Signal VERT - Appui touche V');
        await sendKey('v');
      } else if (data.type === 'RED') {
        console.log('Signal ROUGE - Appui touche R');
        await sendKey('r');
      } else if (data.type === 'FINISH') {
        console.log('Signal FINISH - Appui touche F (10s)');
        await sendKey('f');
        setTimeout(async () => {
          console.log('Signal FINISH - Relache touche F');
          await sendKey('f');
        }, 10000);
      }
    } catch (e) {
      console.error('Erreur:', e.message);
    }
  });

  ws.on('close', () => {
    console.log('Connexion fermee');
  });
});

process.on('SIGINT', () => {
  console.log('Arret du serveur...');
  wss.close(() => process.exit(0));
});
