import React, { useState } from 'react';

const stopwords = new Set([
  "the", "is", "in", "and", "to", "of", "a", "that", "it",
  "on", "for", "you", "this", "with", "but", "are"
]);

function KeywordInsightsPage() {
  const [text, setText] = useState('');
  const [wordCounts, setWordCounts] = useState([]);

  const analyzeText = () => {
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word && !stopwords.has(word));
    const counts = {};
    words.forEach(word => counts[word] = (counts[word] || 0) + 1);
    const sortedWords = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    setWordCounts(sortedWords);
  };

  return (
    <div>
      <h2>Keyword Insights</h2>
      <textarea
        rows={6}
        cols={50}
        placeholder="Enter your text here..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <br />
      <button onClick={analyzeText}>Analyze Keywords</button>
      {wordCounts.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Word</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {wordCounts.map(([word, count]) => (
              <tr key={word}>
                <td>{word}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default KeywordInsightsPage;
