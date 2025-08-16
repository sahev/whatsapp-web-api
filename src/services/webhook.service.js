
import axios from 'axios';

export async function trigger(config, event, data) {
  if (!config.webhooks) return;
  for (const webhook of config.webhooks) {
    if (webhook.events.includes(event)) {
        axios.post(webhook.url, { event, data, instance: config.key }).catch(() => {});
        console.log(`[${config.key}][${webhook.url}] webhook called`);
    }
  }
}