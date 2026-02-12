const WebSocket = require('ws');
const { exec } = require('child_process');
const path = require('path');

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

let musicProcess = null;

function stopMusic() {
  if (musicProcess) {
    musicProcess.kill();
    musicProcess = null;
    console.log('Musique arretee');
  }
}

function playMusic(filePath) {
  stopMusic();
  const absolutePath = path.resolve(__dirname, filePath);
  console.log(`Lecture musique: ${absolutePath}`);
  const cmd = `powershell -command "$player = New-Object -ComObject WMPlayer.OCX; $player.URL = '${absolutePath}'; $player.controls.play(); Start-Sleep -Seconds 60"`;
  musicProcess = exec(cmd, (error) => {
    if (error && error.killed !== true) {
      console.error('Erreur lecture musique:', error.message);
    }
    musicProcess = null;
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
console.log('  Musique:');
console.log('    music/perfect.mp3 = Score parfait 10/10');
console.log('    music/normal.mp3  = Autre score');
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

        // Jouer la musique selon le score
        if (data.score !== undefined && data.total !== undefined) {
          const isPerfect = data.score === data.total && data.total === 10;
          if (isPerfect) {
            console.log(`SCORE PARFAIT ${data.score}/${data.total} ! Musique speciale !`);
            playMusic('music/perfect.mp3');
          } else {
            console.log(`Score ${data.score}/${data.total} - Musique normale`);
            playMusic('music/normal.mp3');
          }
        }
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
  stopMusic();
  wss.close(() => process.exit(0));
});
