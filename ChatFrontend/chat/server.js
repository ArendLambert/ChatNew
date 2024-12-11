const express = require('express');
const bodyParser = require('body-parser');

// Настройка Express
const app = express();

// Парсинг JSON в теле запроса
app.use(bodyParser.json());

// Мапа для хранения пользователей (ID клиента -> данные соединения)
const clients = {};

// Обработчик запроса на регистрацию (получение ID пользователя)
app.post('/register', (req, res) => {
  const { id } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'ID обязательно' });
  }

  // Регистрация клиента
  clients[id] = {
    id,
    offer: null,
    answer: null,
    candidate: null,
  };

  console.log(`Пользователь с ID ${id} зарегистрирован`);

  res.status(200).json({ id });  // Отправляем ID пользователя в ответе
});


// Обработчик запроса на отправку предложения (offer)
app.post('/offer', (req, res) => {
  const { offer, to } = req.body;

  if (!offer || !to) {
    return res.status(400).json({ error: 'Необходимы offer и to' });
  }

  if (!clients[to]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  // Отправляем предложение пользователю
  clients[to].offer = offer;
  console.log(`Отправлено предложение от пользователя ${req.body.from} пользователю ${to}`);

  res.status(200).json({ message: 'Предложение отправлено' });
});

// Обработчик запроса на отправку ответа (answer)
app.post('/answer', (req, res) => {
  const { answer, to } = req.body;

  if (!answer || !to) {
    return res.status(400).json({ error: 'Необходимы answer и to' });
  }

  if (!clients[to]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  // Отправляем ответ пользователю
  clients[to].answer = answer;
  console.log(`Отправлен ответ от пользователя ${req.body.from} пользователю ${to}`);

  res.status(200).json({ message: 'Ответ отправлен' });
});

// Обработчик запроса на отправку ICE кандидата
app.post('/candidate', (req, res) => {
  const { candidate, to } = req.body;

  if (!candidate || !to) {
    return res.status(400).json({ error: 'Необходимы candidate и to' });
  }

  if (!clients[to]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  // Отправляем ICE кандидата пользователю
  clients[to].candidate = candidate;
  console.log(`Отправлен ICE кандидат от пользователя ${req.body.from} пользователю ${to}`);

  res.status(200).json({ message: 'ICE кандидат отправлен' });
});

// Обработчик для получения данных о сигнализации
app.get('/signal/:userId', (req, res) => {
  const userId = req.params.userId;
  
  if (!clients[userId]) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const client = clients[userId];
  
  // Возвращаем предложение, ответ или ICE кандидата
  res.status(200).json({
    offer: client.offer,
    answer: client.answer,
    candidate: client.candidate,
  });
});

// Очистка пользователей при закрытии соединения
app.post('/disconnect', (req, res) => {
  const { id } = req.body;
  
  if (clients[id]) {
    delete clients[id];
    console.log(`Пользователь с ID ${id} отключился`);
    res.status(200).json({ message: 'Пользователь отключён' });
  } else {
    res.status(404).json({ error: 'Пользователь не найден' });
  }
});

// Стандартный обработчик для корневого маршрута
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Создание HTTP-сервера
const server = app.listen(3001, () => {
  console.log(`Сервер запущен на http://localhost:3001`);
});
