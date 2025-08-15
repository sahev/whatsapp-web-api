
import wppPkg from 'whatsapp-web.js';
import { toDataURL } from 'qrcode';
import { saveConfig, deleteConfig, getAllConfigs } from './storage.service.js';
import { trigger } from './webhook.service.js';
import { sleep, validateBrazilianNumber } from '../utils/utils.js'
import fs from 'fs-extra';
import path from 'path';

const { Client, LocalAuth } = wppPkg;
const instances = {};

export async function create (config) {
    if (!config.key) throw new Error('Instance key required');
    if (instances[config.key]) throw new Error('Instance already exists');

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: config.key }),
        puppeteer: { headless: true, args: ['--no-sandbox'] }
    });

    let qrCode = null;

    client.on('qr', async (qr) => {
        qrCode = await toDataURL(qr);
    });

    client.on('ready', () => {
        trigger(config, 'connection.update', { status: 'ready' });
    });

    client.on('message', async (msg) => {
        if (config.ignoreGroups && msg.from.endsWith('@g.us'))
            return;

        trigger(config, 'messages.upsert', { message: msg });

        if (config.messagesRead) {
            const chat = await msg.getChat();
            await chat.sendSeen();
        }
    });

    client.initialize();

    instances[config.key] = {
        client,
        config,
        qrCode,
        getInfo: () => ({
            key: config.key,
            status: client.info ? 'connected' : 'pending',
            webhooks: config.webhooks
        }),
        getQr: () => qrCode
    };

    await saveConfig(config.key, config);
    return instances[config.key].getInfo();
}

export function get(id) {
  const instance = instances[id];
  if (!instance) return null;

  // Só retorna info se já estiver conectado
  let number = null;
  let name = null;
  if (instance.client && instance.client.info) {
    number = instance.client.info.wid.user;
    name = instance.client.info.pushname;
  }

  return {
    key: instance.config.key,
    status: instance.client && instance.client.info ? 'connected' : 'pending',
    webhooks: instance.config.webhooks,
    number,
    name
  };
}

export async function getQrCode (id) {
    const instance = instances[id];
    if (!instance) throw new Error('Instance not found');
    return instance.getQr();
}

export async function logout (id) {
    const instance = instances[id];
    if (!instance) throw new Error('Instance not found');
    await instance.client.logout();
}

export async function deleteInstance(id) {
    const instance = instances[id];
    if (!instance) throw new Error('Instance not found');
    await instance.client.destroy();
    delete instances[id];
    await deleteConfig(id);

    const authPath = path.join(process.cwd(), '.wwebjs_auth', `session-${id}`);

    try {
        await fs.remove(authPath);
    } catch (e) {
        console.error('Erro ao remover cache:', e.message);
    }
}

export async function loadAll () {
    const configs = await getAllConfigs();
    for (const config of configs) {
        try {
            await create(config);
        } catch (e) {
            console.error(`Erro ao iniciar instância ${config.key}:`, e.message);
        }
    }
}

export async function sendMessage (instanceId, { id, typeId, message, options = {} }) {
    const instance = instances[instanceId];
    if (!instance) throw new Error('Instance not found');

    // Validação do número brasileiro
    if (typeId === 'user') {
        if (!validateBrazilianNumber(id)) throw new Error('Número brasileiro inválido');
    }

    let chatId;
    if (typeId === 'user') {
        chatId = `${id}@c.us`;
    } else if (typeId === 'group') {
        chatId = id.endsWith('@g.us') ? id : `${id}@g.us`;
    } else {
        throw new Error('typeId deve ser "user" ou "group"');
    }

    // Simular digitando
    if (options.delay && options.delay > 0) {
        await instance.client.sendPresenceAvailable();
        await sleep(options.delay * 1000);
    }

    let sendOptions = {};
    if (options.replyFrom) {
        sendOptions = { quotedMessageId: options.replyFrom };
    }

    const sentMsg = await instance.client.sendMessage(chatId, message, sendOptions);
    return sentMsg;
}