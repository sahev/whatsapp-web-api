
import axios from 'axios';

export async function trigger(config, event, data) {
  if (!config.webhooks) return;
  for (const webhook of config.webhooks) {
    if (webhook.events.includes(event)) {
      try {
        await axios.post(webhook.url, { event, data, instance: config.key });
      } catch (e) {
        console.error(`Erro ao enviar webhook para ${webhook.url}:`, e.message);
      }
    }
  }
}