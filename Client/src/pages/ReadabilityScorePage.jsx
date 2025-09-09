import React, { useState } from 'react';

function ReadabilityScorePage() {
  const [text, setText] = useState('');
  const [score, setScore] = useState(null);
  const [level, setLevel] = useState(null);

  const analyzeText = () => {

    const apiUrl = 'http://127.0.0.1:8000/readability-score/';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text }),
    })
    .then(response => {

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setScore(data.score);
      setLevel(data.level);
    })
    .catch(error => {

      console.error('There was a problem with the fetch operation:', error);
    });
  };

  return (
    <div>
      <h2>Readability Score</h2>
      <textarea
        rows={6}
        cols={50}
        placeholder="Enter your text here..."
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <br />
      <button onClick={analyzeText}>Analyze Readability</button>

      {score !== null && (
        <div style={{ marginTop: '20px' }}>
          <strong>Score:</strong> {score} <br />
          <strong>Level:</strong> {level}
          <p>Higher scores mean easier reading.</p>
        </div>
      )}
    </div>
  );
}

export default ReadabilityScorePage;
