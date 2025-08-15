import { create, get, getQrCode, logout, deleteInstance, sendMessage } from '../services/instance.service.js';

export async function createInstance(req, res) {
  try {
    const instance = await create(req.body);
    res.status(201).json(instance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export function getInstance(req, res) {
  const info = get(req.params.id);
  if (!info) return res.status(404).json({ error: 'Instance not found' });
  res.json(info);
}

export async function getQrBase64(req, res) {
  try {
    const qr = await getQrCode(req.params.id);
    if (!qr) return res.status(404).json({ error: 'QR not available' });
    res.json({ qr });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function logoutInstance(req, res) {
  try {
    await logout(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req, res) {
  try {
    await deleteInstance(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function sendText(req, res) {
  const instanceId = req.query.instance;
  const body = req.body;

  try {
    const result = await sendMessage(instanceId, body);
    res.json({ success: true, result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}