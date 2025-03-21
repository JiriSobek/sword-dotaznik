import { json } from 'micro';
let results = [];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = await json(req);
    results.push(data);
    res.status(200).json({ message: 'Výsledek uložen!' });
  } else {
    res.status(405).json({ message: 'Metoda není povolena.' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

