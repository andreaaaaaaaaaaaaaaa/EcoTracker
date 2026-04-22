import { IonPage, IonContent, IonHeader, IonToolbar, IonButtons, IonBackButton } from '@ionic/react';
import { useEffect, useState } from 'react';
import './Memorama.css';
import { useTranslation } from 'react-i18next';

const Memorama: React.FC = () => {
  const { t } = useTranslation();
  const [cards, setCards] = useState<any[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [tries, setTries] = useState(0);
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const cardPairs = [
      { id: 1, emoji: '🍌', label: t('banana_peel'), type: 'material', color: '' },
      { id: 1, emoji: '🌱', label: t('organic'), type: 'category', color: '#4CAF50' },

      { id: 2, emoji: '🍾', label: t('plastic_bottle'), type: 'material', color: '' },
      { id: 2, emoji: '♻️', label: t('recyclable'), type: 'category', color: '#2196F3' },

      { id: 3, emoji: '🔋', label: t('batteries'), type: 'material', color: '' },
      { id: 3, emoji: '⚠️', label: t('hazardous'), type: 'category', color: '#F44336' },

      { id: 4, emoji: '📰', label: t('newspaper'), type: 'material', color: '' },
      { id: 4, emoji: '📦', label: t('paper_and_cardboard'), type: 'category', color: '#8B4513' },

      { id: 5, emoji: '🥫', label: t('can'), type: 'material', color: '' },
      { id: 5, emoji: '🔗', label: t('metal'), type: 'category', color: '#9E9E9E' },

      { id: 6, emoji: '🍺', label: t('glass_bottle'), type: 'material', color: '' },
      { id: 6, emoji: '🟦', label: t('glass'), type: 'category', color: '#00BCD4' },
    ];

    const shuffled = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setTries(0);
    setGameWon(false);
  };

  const handleCardClick = (index: number) => {
    if (flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setTries((t) => t + 1);

      if (cards[newFlipped[0]].id === cards[newFlipped[1]].id) {
        setMatched((m) => [...m, ...newFlipped]);
        setFlipped([]);

        if (matched.length + 2 === cards.length) {
          setGameWon(true);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    }
  };

  return (
    <IonContent
      fullscreen
      className="memorama-container"
      style={{ '--background': '#f0f0e8', '--padding-top': '0px' } as any}
    >
      <h1>{t('memory')}</h1>

      <div style={{ padding: '0 20px 12px 20px', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#36353a', fontSize: 14 }}>
          {t('memory_text')}
        </p>
      </div>

      <div className="memorama-controls">
        <span id="tries">{t('tries')}: <strong>{tries}</strong></span>
        <button onClick={initializeGame} className="memorama-btn-reset">{t('reset')}</button>
      </div>

      <div className="memorama-game" id="memorama-game">
        {cards.map((card, index) => (
          <button
            key={index}
            className={`memorama-card ${card.type} ${flipped.includes(index) || matched.includes(index) ? 'memorama-card--flipped' : ''}`}
            style={
              (flipped.includes(index) || matched.includes(index)) && card.type === 'category'
                ? { backgroundColor: card.color }
                : {}
            }
            onClick={() => handleCardClick(index)}
          >
            {flipped.includes(index) || matched.includes(index) ? (
              <div className="memorama-card__content">
                <div className="memorama-card__emoji">{card.emoji}</div>
                <div className="memorama-card__label">{card.label}</div>
              </div>
            ) : (
              <div className="memorama-card__content">
                <div className="memorama-card__question">?</div>
              </div>
            )}
          </button>
        ))}
      </div>

      {gameWon && (
        <div className="memorama-overlay" id="memorama-win">
          <div className="memorama-popup">
            <h2>{t('well_done')}</h2>
            <p>{t('you_completed')} <strong>{tries}</strong> {t('tries_juego')}.</p>
            <button onClick={initializeGame} className="memorama-btn-reset">{t('play_again')}</button>
          </div>
        </div>
      )}
    </IonContent>
  );
};

export default Memorama;