import React, { useState } from 'react';

function fleschKincaid(text) {
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const words = text.split(/\s+/).filter(Boolean).length;
  const syllables = text.toLowerCase().split(/\s+/).reduce((count, word) => {
    const wordSyllables = word.match(/[aeiouy]+/g)?.length || 0;
    return count + wordSyllables;
  }, 0);
  if (sentences === 0 || words === 0) return 0;
  return Math.round(
    206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  );
}

function getReadingLevel(score) {
  if(score >= 90) return "Very easy (Middle School level)";
  if(score >= 60) return "Plain English (High School level)";
  if(score >= 0) return "College graduate level";
  return "Extremely difficult/academic";
}

function ReadabilityScorePage() {
  const [text, setText] = useState('');
  const [score, setScore] = useState(null);

  const analyzeText = () => {
    const readabilityScore = fleschKincaid(text);
    setScore(readabilityScore);
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
          <strong>Level:</strong> {getReadingLevel(score)}
          <p>Higher scores mean easier reading.</p>
        </div>
      )}
    </div>
  );
}

export default ReadabilityScorePage;
