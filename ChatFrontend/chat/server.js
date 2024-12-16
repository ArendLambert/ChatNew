const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

// Мапа для хранения пользователей (ID клиента -> данные соединения)
const clients = {};


app.post('/register', async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'ID обязательно' });
  }

  clients[id] = {
    id,
    offer: null,
    answer: null,
    candidates: null,
    from: null,
  };

  console.log(`Пользователь с ID ${id} зарегистрирован`);
  res.status(200).json({ id });
});

app.post('/offer', async (req, res) => {
  const { offer, to, from } = req.body;
  console.log("offer");
  console.log(offer);
  if (!offer || !to || !from) {
    return res.status(400).json({ error: 'Необходимы offer, to и from' });
  }

  if (!clients[to]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  clients[to].offer = offer;
  clients[to].from = from;
  console.log(`Пользователь ${from} отправил offer пользователю ${to}`);
  res.status(200).json({ message: 'Offer отправлен' });
});

app.post('/answer', async (req, res) => {
  const { answer, to, from } = req.body;
  console.log("answer");
  console.log(answer);
  if (!answer || !to || !from) {
    return res.status(400).json({ error: 'Необходимы answer, to и from' });
  }

  if (!clients[to]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  clients[to].answer = answer;
  clients[to].from = from;
  console.log(`Пользователь ${from} отправил answer пользователю ${to}`);
  res.status(200).json({ message: 'Answer отправлен' });
});

// Обмен данными о сети
app.post('/candidate', async (req, res) => {
  const { candidate, to, from } = req.body;
  if (!candidate || !to || !from) {
    return res.status(400).json({ error: 'Необходимы candidate, to и from' });
  }
  if (!clients[to]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }
  clients[to].candidates = clients[to].candidates || [];
  clients[to].candidates.push(candidate);
  clients[to].from = from;
  console.log(`Пользователь ${from} отправил ICE кандидат пользователю ${to}`);
  res.status(200).json({ message: 'Candidate отправлен' });
});

// Получение сигналов из пула
app.get('/signal/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!clients[userId]) {
    return res.status(405).json({ error: 'Пользователь не найден' });
  }

  const client = clients[userId];

  if (!client.offer && !client.answer && !client.candidate) {
    return res.status(406).json({message: "Нет доступных сигналов"});
  }

  res.status(200).json({
    offer: client.offer,
    answer: client.answer,
    candidate: client.candidate,
    fromUserId: client.from,
  });

  client.offer = null;
  client.answer = null;
  client.candidate = null;
  client.from = null;
});

// Отключение пользователя
app.post('/disconnect', async (req, res) => {
  const { id } = req.body;

  if (clients[id]) {
    delete clients[id];
    console.log(`Пользователь с ID ${id} отключился`);
    res.status(200).json({ message: 'Пользователь отключён' });
  } else {
    res.status(404).json({ error: 'Пользователь не найден' });
  }
});

// Для тестирования
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(3001, () => {
  console.log('Сервер запущен на http://localhost:3001');
});
