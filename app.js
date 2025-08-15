import express, { json } from 'express';
import routes from './routes.js';
import { loadAll } from './src/services/instance.service.js';

const app = express();
app.use(json());
app.use(routes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  await loadAll(); // Carrega instâncias salvas ao iniciar
  console.log(`API rodando na porta ${PORT}`);
});