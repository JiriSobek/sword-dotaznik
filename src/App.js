import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";

const questions = [
  {
    category: "Bezpečné zázemí",
    items: [
      "Vím, že se mohu obrátit na svého vedoucího, když mám problém.",
      "Mám v týmu kolegy, kteří mě podporují, když zažívám stres.",
      "Vedení se o nás jako o tým zajímá nejen kvůli výkonu, ale i kvůli naší pohodě."
    ]
  },
  {
    category: "Pocit ocenění",
    items: [
      "Mám pocit, že si vedení váží mé práce.",
      "Klienti a jejich rodiny mi dávají najevo uznání.",
      "V týmu se vzájemně podporujeme a chválíme, když někdo odvede dobrou práci."
    ]
  },
  {
    category: "Smysl práce",
    items: [
      "Moje práce má pro mě smysl a odpovídá mým hodnotám.",
      "Vidím, že moje práce pozitivně ovlivňuje kvalitu života klientů.",
      "Mám možnost podílet se na rozhodování o tom, jak bude péče o klienta vypadat."
    ]
  },
  {
    category: "Pracovní zátěž",
    items: [
      "Můj pracovní rozvrh je udržitelný a nepřetěžuji se.",
      "Po směně mám dostatek energie na osobní život a odpočinek.",
      "Máme dostatek pracovníků na směně, aby bylo možné poskytovat kvalitní péči bez stresu."
    ]
  },
  {
    category: "Supervize a podpora",
    items: [
      "Mám pravidelné supervize, kde můžu sdílet obtížné situace.",
      "Cítím, že supervize nejsou jen formální, ale opravdu mi pomáhají zvládat zátěž.",
      "Mám možnost podílet se na rozhodování o rozvoji služeb a změnách v organizaci."
    ]
  },
  {
    category: "Učení a rozvoj",
    items: [
      "Mám přístup ke školením a kurzům, které mi pomáhají zlepšit péči o klienty.",
      "Vedení mě podporuje v kariérním rozvoji (např. specializace, vyšší kvalifikace).",
      "V týmu se učíme navzájem a sdílíme zkušenosti z praxe."
    ]
  }
];

const options = [
  { label: "Úplně souhlasím", value: 3 },
  { label: "Spíše souhlasím", value: 2 },
  { label: "Spíše nesouhlasím", value: 1 },
  { label: "Vůbec nesouhlasím", value: 0 }
];

export default function SwordDotaznik() {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [viewResults, setViewResults] = useState(false);
  const [averageResults, setAverageResults] = useState([]);
  const [averageScore, setAverageScore] = useState(0);

  const chartColors = [
    "#4CAF50",
    "#2196F3",
    "#FFC107",
    "#FF5722",
    "#9C27B0",
    "#00BCD4"
  ];

  const handleChange = (category, questionIdx, value) => {
    setAnswers(prev => ({
      ...prev,
      [`${category}-${questionIdx}`]: value
    }));
  };

  const handleSubmit = async () => {
    const chartData = questions.map((q, index) => ({
      category: q.category,
      score: calculateCategoryScore(q.category),
    }));

    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chartData),
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Chyba při odesílání výsledků:', error);
    }
  };

  const calculateCategoryScore = (category) => {
    const cat = questions.find(q => q.category === category);
    const scores = cat.items.map((_, idx) => answers[`${category}-${idx}`] || 0);
    const total = scores.reduce((sum, val) => sum + val, 0);
    return total / cat.items.length;
  };

  const calculateTotalScore = () => {
    const allScores = questions.flatMap(q =>
      q.items.map((_, idx) => answers[`${q.category}-${idx}`] || 0)
    );
    const total = allScores.reduce((sum, val) => sum + val, 0);
    return total / allScores.length;
  };

  const fetchAverageResults = async () => {
    try {
      const response = await fetch('/api/results');
      const data = await response.json();
      setAverageResults(data.averageResults.map((item, index) => ({
        ...item,
        fill: chartColors[index % chartColors.length]
      })));
      setAverageScore(data.averageScore);
    } catch (error) {
      console.error('Chyba při načítání výsledků:', error);
    }
  };

  const clearResults = async () => {
    try {
      await fetch('/api/results', {
        method: 'DELETE',
      });
      alert('Výsledky byly vynulovány.');
      setAverageResults([]);
      setAverageScore(0);
    } catch (error) {
      console.error('Chyba při mazání výsledků:', error);
    }
  };

  useEffect(() => {
    if (viewResults) {
      fetchAverageResults();
    }
  }, [viewResults]);

  if (viewResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Souhrnné výsledky všech účastníků</h1>

       <ResponsiveContainer width="100%" height={350}>
  <BarChart data={averageResults}>
    <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" />
    <YAxis domain={[1, 3]} />  {/* Možná by mělo být [0, 3], pokud je min. 0! */}
    <Tooltip />
    {/* <Legend /> */}  // smazáno nebo zakomentováno
    <Bar dataKey="score">
      {averageResults.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={entry.fill} />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>


        <div className="mt-20 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Celkové průměrné skóre</h3>
          <p className="text-xl font-bold">{averageScore.toFixed(1)} / 3</p>
        </div>

        <button
          type="button"
          onClick={clearResults}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 mt-6"
        >
          Vynulovat výsledky
        </button>
      </div>
    );
  }

  const chartData = questions.map((q, index) => ({
    category: q.category,
    score: calculateCategoryScore(q.category),
    fill: chartColors[index % chartColors.length]
  }));

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">SWORD DOTAZNÍK - Reflexe pracovního prostředí</h1>

      {!submitted ? (
        <form>
          {questions.map((q, i) => (
            <div key={i} className="mb-8">
              <h2 className="text-xl font-semibold mb-4">{q.category}</h2>
              {q.items.map((item, idx) => (
                <div key={idx} className="mb-4">
                <p className="mb-2 font-bold text-gray-500">{item}</p>
                  <div className="flex flex-col gap-2">
                    {options.map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`${q.category}-${idx}`}
                          value={opt.value}
                          onChange={() => handleChange(q.category, idx, opt.value)}
                          checked={answers[`${q.category}-${idx}`] === opt.value}
                          className="form-radio"
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Odeslat a zobrazit výsledky
          </button>
        </form>
      ) : (
        <div>
          <h2 className="text-xl font-bold mb-4">Výsledky hodnocení</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" />
              <YAxis domain={[1, 3]} />
              <Tooltip />
              <Bar dataKey="score">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-15 p-4 border rounded bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">Celkové skóre</h3>
            <p className="text-xl font-bold">{calculateTotalScore().toFixed(1)} / 3</p>
          </div>

                </div>
      )}
    </div>
  );
}
