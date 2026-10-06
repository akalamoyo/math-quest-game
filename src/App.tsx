import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { User } from 'firebase/auth';
import {
  auth,
  loginWithGoogle,
  savePlayerScore,
  subscribeToLeaderboard,
} from './firebase';
import { levels, getLevelProgressLabel, type Level } from './levels';

type LeaderboardEntry = {
  name: string;
  score: number;
  uid: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [stars, setStars] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [unlockedLevel, setUnlockedLevel] = useState(1);
  const [gameState, setGameState] = useState<'login' | 'playing' | 'complete'>('login');

  const activeLevel: Level = useMemo(() => {
    return levels.find((level) => level.number === currentLevel) ?? levels[0];
  }, [currentLevel]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setGameState('playing');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = subscribeToLeaderboard((entries) => {
      setLeaderboard(entries);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const savedStars = Number(localStorage.getItem('mathQuestStars') || '0');
    const savedUnlocked = Number(localStorage.getItem('mathQuestUnlocked') || '1');
    const savedCompleted = JSON.parse(localStorage.getItem('mathQuestCompleted') || '[]') as number[];

    setStars(savedStars);
    setUnlockedLevel(savedUnlocked);
    setCompletedLevels(savedCompleted);
  }, []);

  useEffect(() => {
    localStorage.setItem('mathQuestStars', String(stars));
    localStorage.setItem('mathQuestUnlocked', String(unlockedLevel));
    localStorage.setItem('mathQuestCompleted', JSON.stringify(completedLevels));
  }, [stars, unlockedLevel, completedLevels]);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      setGameState('playing');
    } catch (error) {
      console.error(error);
      setFeedback('Login failed. Please try again.');
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) {
      setFeedback('Choose a number first!');
      return;
    }

    setIsChecking(true);
    const answer = Number(selectedAnswer);
    const rightAnswer = activeLevel.answer;

    if (answer === rightAnswer) {
      const newStars = stars + 10;
      setStars(newStars);
      setFeedback('Correct! Great job!');

      const nextCompleted = [...new Set([...completedLevels, currentLevel])];
      setCompletedLevels(nextCompleted);

      const nextUnlocked = Math.max(unlockedLevel, Math.min(10, currentLevel + 1));
      setUnlockedLevel(nextUnlocked);

      if (user) {
        await savePlayerScore(user.uid, user.displayName || 'Player', newStars);
      }

      setTimeout(() => {
        if (currentLevel >= 10) {
          setGameState('complete');
          setFeedback('You completed all 10 levels!');
        } else {
          setCurrentLevel((prev) => Math.min(prev + 1, 10));
          setSelectedAnswer('');
          setFeedback('');
        }
        setIsChecking(false);
      }, 800);
    } else {
      setFeedback('Not quite! Try again and use your math brain!');
      setSelectedAnswer('');
      setIsChecking(false);
    }
  };

  const handleLevelClick = (levelNumber: number) => {
    if (levelNumber <= unlockedLevel) {
      setCurrentLevel(levelNumber);
      setFeedback('');
      setSelectedAnswer('');
      setGameState('playing');
    }
  };

  if (!user) {
    return (
      <div className="page-shell">
        <motion.div
          className="card login-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="badge">Math Quest Adventure</div>
          <h1>Welcome, young explorer!</h1>
          <p>
            Solve number puzzles, unlock new worlds, and race to the top of the leaderboard.
          </p>
          <button className="primary-btn" onClick={handleLogin}>
            Login with Gmail
          </button>
          <div className="mini-note">For kids ages 5–8</div>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'complete') {
    return (
      <div className="page-shell">
        <motion.div
          className="card login-card"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="badge">Champion Status</div>
          <h1>🎉 You did it!</h1>
          <p>
            You completed all 10 levels and earned <strong>{stars}</strong> stars.
          </p>
          <button
            className="primary-btn"
            onClick={() => {
              setCurrentLevel(1);
              setGameState('playing');
              setFeedback('');
              setSelectedAnswer('');
            }}
          >
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <div className="badge">Player: {user.displayName || 'Explorer'}</div>
          <h2>Math Quest Adventure</h2>
        </div>
        <div className="top-stats">
          <span>⭐ {stars}</span>
          <span>🏆 #{leaderboard.findIndex((entry) => entry.uid === user.uid) + 1 || 1}</span>
        </div>
      </header>

      <main className="game-layout">
        <aside className="panel level-panel">
          <h3>Adventure Map</h3>
          <div className="level-grid">
            {levels.map((level) => {
              const isUnlocked = level.number <= unlockedLevel;
              const isCompleted = completedLevels.includes(level.number);
              return (
                <button
                  key={level.number}
                  onClick={() => handleLevelClick(level.number)}
                  className={`level-button ${currentLevel === level.number ? 'active' : ''} ${isUnlocked ? '' : 'locked'}`}
                  disabled={!isUnlocked}
                >
                  <span>Level {level.number}</span>
                  <small>{isCompleted ? '✅ Clear' : isUnlocked ? getLevelProgressLabel(level.number) : '🔒 Locked'}</small>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="panel challenge-panel">
          <div className="challenge-header">
            <div>
              <span className="eyebrow">Level {activeLevel.number}</span>
              <h3>{activeLevel.title}</h3>
            </div>
            <div className="tag">{activeLevel.theme}</div>
          </div>

          <div className="question-box">
            <p>{activeLevel.prompt}</p>
            <div className="answer-row">
              {Array.from({ length: 16 }).map((_, idx) => (
                <button
                  key={idx}
                  className={`answer-button ${selectedAnswer === String(idx) ? 'selected' : ''}`}
                  onClick={() => setSelectedAnswer(String(idx))}
                >
                  {idx}
                </button>
              ))}
            </div>
            <button className="primary-btn submit-btn" onClick={submitAnswer} disabled={isChecking || !selectedAnswer}>
              {isChecking ? 'Checking...' : 'Submit Answer'}
            </button>
            {feedback && <p className="feedback">{feedback}</p>}
          </div>
        </section>

        <aside className="panel leaderboard-panel">
          <h3>Leaderboard</h3>
          <ul className="leaderboard-list">
            {leaderboard.length === 0 ? (
              <li>Loading...</li>
            ) : (
              leaderboard.slice(0, 5).map((entry, index) => (
                <li key={entry.uid} className={entry.uid === user.uid ? 'me' : ''}>
                  <span>#{index + 1} {entry.name}</span>
                  <strong>{entry.score}</strong>
                </li>
              ))
            )}
          </ul>
        </aside>
      </main>
    </div>
  );
}

export default App;
