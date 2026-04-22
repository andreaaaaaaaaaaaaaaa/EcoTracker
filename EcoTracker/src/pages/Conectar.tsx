import React, { useEffect, useState } from 'react';
import { IonPage, IonContent, IonHeader, IonImg } from '@ionic/react';
import './Conectar.css';
import { useTranslation } from 'react-i18next';

const Conectar: React.FC = () => {
  const { t } = useTranslation();
  const [matchedCount, setMatchedCount] = useState(0);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [matchedIds, setMatchedIds] = useState<number[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [leftItems, setLeftItems] = useState<any[]>([]);
  const [rightItems, setRightItems] = useState<any[]>([]);

  const plasticTypes = [
    { id: 1, name: t('pete_or_pet'), img: '../../assets/pet.avif' },
    { id: 2, name: t('hdpe_or_pehd'), img: '../../assets/hdpe.avif' },
    { id: 3, name: t('pvc_or_v'), img: '../../assets/pvc.avif' },
    { id: 4, name: t('ldpe_or_peld'), img: '../../assets/ldpe.avif' },
    { id: 5, name: 'PP', img: '../../assets/pp.avif' },
    { id: 6, name: 'PS', img: '../../assets/ps.avif' },
    { id: 7, name: t('other_or_o'), img: '../../assets/other.avif' },
  ];

  const descriptions = [
    { id: 1, description: t('used_for_packaging') },
    { id: 2, description: t('found_in_detergent') },
    { id: 3, description: t('used_in_plumbing') },
    { id: 4, description: t('flexible_plastic_used') },
    { id: 5, description: t('used_in_food') },
    { id: 6, description: t('found_in_disposable') },
    { id: 7, description: t('micellaneous_plastics') },
  ];

  useEffect(() => {
    initializeGame();
  }, []);

  const shuffle = (arr: any[]) => arr.slice().sort(() => Math.random() - 0.5);

  const initializeGame = () => {
    setLeftItems(shuffle(plasticTypes));
    setRightItems(shuffle(descriptions));
    setMatchedIds([]);
    setMatchedCount(0);
    setDraggedItem(null);
    setGameWon(false);
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(id);
  };

  const handleDragEnd = () => setDraggedItem(null);

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const draggedId = data ? Number(data) : draggedItem;
    if (draggedId == null) return;
    if (matchedIds.includes(targetId)) return;

    if (draggedId === targetId) {
      const newMatched = [...matchedIds, targetId];
      setMatchedIds(newMatched);
      setMatchedCount(newMatched.length);
      setDraggedItem(null);
      if (newMatched.length === plasticTypes.length) setGameWon(true);
    } else {
      setDraggedItem(null);
    }
  };

  const handleReset = () => initializeGame();

  return (
    <IonContent className="conectar-container" style={{ '--background': '#f0f0e8' } as any}>
  <div className="conectar-wrap">
    <h1>{t('connect')}</h1>

    <div style={{ padding: '0 20px 12px 20px', textAlign: 'center' }}>
      <p style={{ margin: 0, color: '#333135', fontSize: 14 }}>
        {t('connect_text')}
      </p>
    </div>

    <div className="conectar-controls">
      <div id="status">{t('matched')}: <span id="matched">{matchedCount}</span>/<span id="total">{plasticTypes.length}</span></div>
      <button id="reset" onClick={handleReset} className="conectar-btn-reset">{t('reset')}</button>
    </div>

    <main className="conectar-game">
      <section className="conectar-left" id="symbols" aria-label="plastic symbols">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%' }}>
          {leftItems.map((plastic) => {
            const isMatched = matchedIds.includes(plastic.id);
            return !isMatched ? (
              <div
                key={plastic.id}
                className={`conectar-item ${draggedItem === plastic.id ? 'conectar-item--dragging' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, plastic.id)}
                onDragEnd={handleDragEnd}
                aria-label={plastic.name}
              >
                <div className="conectar-icon" aria-hidden>
                  <IonImg src={plastic.img} alt={plastic.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div className="conectar-name" style={{ fontSize: 9 }}>{plastic.name}</div>
              </div>
            ) : null;
          })}
        </div>
      </section>

      <section className="conectar-right" id="targets" aria-label="descriptions">
        {rightItems.map((desc) => {
          const locked = matchedIds.includes(desc.id);
          return (
            <div
              key={desc.id}
              className={`conectar-target ${locked ? 'conectar-target--locked' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, desc.id)}
              style={{
                backgroundColor: locked ? '#D4EDDA' : '#F7FAFF',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 12,
                border: locked ? '2px solid #28A745' : '2px solid transparent',
                color: '#04293A',
              }}
            >
              <div className="conectar-desc" style={{ color: locked ? '#155724' : '#374151', fontSize: 13 }}>{desc.description}</div>
            </div>
          );
        })}
      </section>
    </main>
  </div>

  {gameWon && (
    <div className="conectar-overlay">
      <div className="conectar-modal">
        <h2>{t('well_done')}</h2>
        <p>{t('you_matched')}</p>
        <button onClick={handleReset} className="conectar-btn-reset">{t('play_again')}</button>
      </div>
    </div>
  )}
</IonContent>
  );
};

export default Conectar;