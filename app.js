import express, { json } from 'express';
import cors from 'cors';
import routes from './routes.js';
import { loadAll } from './src/services/instance.service.js';

const app = express();
app.use(cors());
app.use(json());
app.use(routes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, async () => {
  await loadAll();
  console.log(`running on ${PORT}`);
});