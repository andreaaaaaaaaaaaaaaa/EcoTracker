import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import './Preguntas.css';
import { useTranslation } from 'react-i18next';

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Stores translation keys instead of translated strings
// so language changes work correctly without restarting the game
interface ShuffledQuestion {
  questionKey: string;
  optionKeys: string[];
  correct: number;
}

const shuffleQuestions = (questions: ShuffledQuestion[]): ShuffledQuestion[] => {
  const shuffledQuestions = shuffleArray(questions);

  return shuffledQuestions.map(q => {
    const optionsWithIndex = q.optionKeys.map((key, idx) => ({
      key,
      wasCorrect: idx === q.correct,
    }));

    const shuffledOptions = shuffleArray(optionsWithIndex);
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.wasCorrect);

    return {
      questionKey: q.questionKey,
      optionKeys: shuffledOptions.map(opt => opt.key),
      correct: newCorrectIndex,
    };
  });
};

const Preguntas: React.FC = () => {
  const [lives, setLives] = useState(3);
  const [progress, setProgress] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState(5);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctAnswered, setCorrectAnswered] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);

  const { t } = useTranslation();

  const trashEmojis = ['🍔', '🍕', '🥤', '🍜', '🎂', '🍓', '🥫', '🍺', '☕', '🧁'];

  const allQuestions: ShuffledQuestion[] = [
    {
      questionKey: 'how_much_energy',
      optionKeys: ['25_percent_energy', '95_percent_energy', '50_percent_energy'],
      correct: 1,
    },
    {
      questionKey: 'what_is_the',
      optionKeys: ['prevents_overfilled', 'saves_money', 'looks_good'],
      correct: 0,
    },
    {
      questionKey: 'how_much_co2',
      optionKeys: ['100kg', 'over_300', '50kg'],
      correct: 1,
    },
    {
      questionKey: 'how_much_less',
      optionKeys: ['35%_less', '50%_less', '74%_less'],
      correct: 2,
    },
    {
      questionKey: 'according_to',
      optionKeys: ['30%_more', '88%_more', '50%_more'],
      correct: 1,
    },
    {
      questionKey: 'how_many_coal',
      optionKeys: ['50_plants', '80_plants', '100_plants'],
      correct: 1,
    },
    {
      questionKey: 'how_much_wood',
      optionKeys: ['1_ton', 'over_2_tons', 'half_a_ton'],
      correct: 1,
    },
    {
      questionKey: 'how_much_water',
      optionKeys: ['20%_less', '35%_less', '50%_less'],
      correct: 1,
    },
    {
      questionKey: 'by_how_much',
      optionKeys: ['up_to_15', 'up_to_30', 'up_to_50'],
      correct: 1,
    },
    {
      questionKey: 'how_many_metric',
      optionKeys: ['100_million', '193_million', '250_million'],
      correct: 1,
    },
    {
      questionKey: 'what_does_reusing',
      optionKeys: ['only_energy', 'finite_natural', 'just_money'],
      correct: 1,
    },
    {
      questionKey: 'what_harmful_gas',
      optionKeys: ['oxygen', 'methane', 'nitrogen'],
      correct: 1,
    },
    {
      questionKey: 'by_what_percentage',
      optionKeys: ['up_to_50', 'up_to_80', 'up_to_30'],
      correct: 1,
    },
  ];

  const questions = shuffleArray(allQuestions).slice(0, 5);

  useEffect(() => {
    setShuffledQuestions(shuffleQuestions(questions));
    resetGame();
  }, []);

  const handleAnswer = (selectedIndex: number) => {
    if (answered && !correctAnswered) return;

    setSelectedAnswer(selectedIndex);
    setAnswered(true);

    if (selectedIndex === shuffledQuestions[currentQuestion].correct) {
      setCorrectAnswered(true);
      setTimeout(() => {
        setVisibleLayers((l) => Math.max(0, l - 1));
        setProgress((p) => p + 1);

        if (progress + 1 === shuffledQuestions.length) {
          setTimeout(() => setGameWon(true), 600);
        } else {
          nextQuestion();
        }
      }, 1200);
    } else {
      setLives((l) => {
        const newLives = l - 1;
        if (newLives <= 0) {
          setTimeout(() => setGameLost(true), 800);
        }
        return newLives;
      });
      setTimeout(() => {
        setSelectedAnswer(null);
        setAnswered(false);
      }, 800);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectAnswered(false);
    setCurrentQuestion((c) => Math.min(c + 1, shuffledQuestions.length - 1));
  };

  const resetGame = () => {
    setLives(3);
    setProgress(0);
    setCurrentQuestion(0);
    setGameWon(false);
    setGameLost(false);
    setVisibleLayers(5);
    setSelectedAnswer(null);
    setAnswered(false);
    setCorrectAnswered(false);
    setShuffledQuestions(shuffleQuestions(questions));
  };

  const generateTrashLayer = (layerIndex: number) => {
    const trash: React.ReactNode[] = [];
    const itemsPerLayer = 12;

    for (let i = 0; i < itemsPerLayer; i++) {
      trash.push(
        <div
          key={`${layerIndex}-${i}`}
          className={`trash-item-preguntas layer-${layerIndex}`}
          style={{
            left: `${(i * 100) / itemsPerLayer + Math.random() * 5}%`,
            top: `${20 + layerIndex * 12 + Math.random() * 8}%`,
          }}
        >
          {trashEmojis[Math.floor(Math.random() * trashEmojis.length)]}
        </div>
      );
    }
    return trash;
  };

  if (gameWon) {
    return (
      <IonPage>
        <IonContent className="preguntas-container" style={{ '--background': '#F3E3FF' } as any}>
          <div className="page-preguntas">
            <div className="overlay-preguntas">
              <div className="modal-preguntas">
                <h2>{t('ocean_is_clean')}</h2>
                <p>{t('the_whales')}</p>
                <button onClick={resetGame} className="btn-modal">{t('play_again')}</button>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (gameLost) {
    return (
      <IonPage>
        <IonContent className="preguntas-container" style={{ '--background': '#F3E3FF' } as any}>
          <div className="page-preguntas">
            <div className="overlay-preguntas">
              <div className="modal-preguntas">
                <h2>{t('game_over')}</h2>
                <p>{t('you_lost')}</p>
                <button onClick={resetGame} className="btn-modal">{t('try_again')}</button>
              </div>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (!shuffledQuestions.length) {
    return null;
  }

  return (
    <IonPage>
      <IonContent className="preguntas-container" style={{ '--background': '#f0f0e8' } as any}>
        <div className="page-preguntas">
          <header>
            <h1>{t('clean')}</h1>
            <div className="instructions-preguntas">
              <p>{t('clean_instructions')}</p>
            </div>
            <div className="hud-preguntas">
              <div className="lives-preguntas">
                {t('lives')}: <span id="lives">{'❤️'.repeat(lives)}</span>
              </div>
              <div className="progress-preguntas">
                {t('trash_removed')} <span id="progress">{progress}</span>/{shuffledQuestions.length}
              </div>
              <button id="restart" onClick={resetGame} className="btn-restart-preguntas">
                {t('reset')}
              </button>
            </div>
          </header>

          <main>
            <div id="ocean" className="ocean-preguntas">
              {Array.from({ length: visibleLayers }).map((_, layerIndex) => (
                <div key={layerIndex} className={`trash-layer-preguntas layer-${layerIndex}`}>
                  {generateTrashLayer(layerIndex)}
                </div>
              ))}
            </div>

            <section className="question-panel-preguntas">
              <div id="question" className="question-preguntas">
                {t(shuffledQuestions[currentQuestion].questionKey)}
              </div>
              <div id="options" className="options-preguntas">
                {shuffledQuestions[currentQuestion].optionKeys.map((key, index) => {
                  let buttonClass = 'opt-preguntas';

                  if (answered && selectedAnswer === index && index !== shuffledQuestions[currentQuestion].correct) {
                    buttonClass += ' wrong';
                  }

                  if (correctAnswered && index === shuffledQuestions[currentQuestion].correct) {
                    buttonClass += ' correct';
                  }

                  return (
                    <button
                      key={index}
                      className={buttonClass}
                      onClick={() => handleAnswer(index)}
                      disabled={answered && !correctAnswered}
                    >
                      {t(key)}
                    </button>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Preguntas;