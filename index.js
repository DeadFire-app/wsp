const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const express = require('express');
const simpleGit = require('simple-git');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({ auth: state });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const texto = msg.message.conversation?.toLowerCase() || '';
    const jid = msg.key.remoteJid;

    if (texto === '!ping') {
      await sock.sendMessage(jid, { text: '🏓 Pong!' });
    }

    if (texto === '!hora') {
      const hora = new Date().toLocaleTimeString('es-AR');
      await sock.sendMessage(jid, { text: `🕒 Hora actual: ${hora}` });
    }

    if (texto === '!ayuda') {
      await sock.sendMessage(jid, {
        text: `📋 Comandos disponibles:\n\n• !ping → responde Pong\n• !hora → hora actual\n• !ayuda → muestra este menú`
      });
    }
  });

  const app = express();
  app.use(express.json());

  app.post('/webhook', async (req, res) => {
    console.log('📥 Webhook recibido de GitHub');
    const git = simpleGit();
    await git.pull();

    const destino = '5493487231547@s.whatsapp.net';
    await sock.sendMessage(destino, { text: 'me actualicé' });

    res.sendStatus(200);
  });

  app.listen(3000, () => console.log('🌐 Webhook escuchando en puerto 3000'));
}

startBot();
