let results = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    if (results.length === 0) {
      return res.status(200).json({ averageResults: [], averageScore: 0 });
    }

    const summed = results.reduce((acc, result) => {
      result.forEach((item, index) => {
        if (!acc[index]) {
          acc[index] = { category: item.category, total: 0 };
        }
        acc[index].total += item.score;
      });
      return acc;
    }, []);

    const averageResults = summed.map(item => ({
      category: item.category,
      score: item.total / results.length
    }));

    const averageScore = averageResults.reduce((sum, item) => sum + item.score, 0) / averageResults.length;

    res.status(200).json({ averageResults, averageScore });
  }

  if (req.method === 'DELETE') {
    results = [];
    res.status(200).json({ message: 'Výsledky byly vynulovány.' });
  }
}
