import React, { useState, useEffect } from 'react';
import './index.css';
import { Question, Answers } from './types';

function App() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [status, setStatus] = useState<'loading' | 'form' | 'thankyou'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/questions')
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки вопросов');
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        setStatus('form');
      })
      .catch(err => {
        setError(err.message);
        setStatus('form');
      });
  }, []);

  const handleInputChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const res = await fetch('/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error('Ошибка отправки ответов');
      
      setStatus('thankyou');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    }
  };

  if (status === 'loading') {
    return (
      <div className="container">
        <div className="card">
          <p className="loading">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (status === 'thankyou') {
    return (
      <div className="container">
        <div className="card thank-you">
          <h1>Спасибо!</h1>
          <p>Ваши ответы приняты. Мы ценим ваше мнение.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Мини-анкета</h1>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {questions.map(question => (
            <div key={question.id} className="form-group">
              <label htmlFor={`question-${question.id}`}>
                {question.text}
              </label>
              <input
                id={`question-${question.id}`}
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleInputChange(question.id, e.target.value)}
                required
              />
            </div>
          ))}
          
          <button type="submit" className="submit-btn">
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
