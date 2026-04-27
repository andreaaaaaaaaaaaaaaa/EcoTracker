import React, { useEffect, useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { IonContent, IonImg } from '@ionic/react';
import './Conectar.css';
import { useTranslation } from 'react-i18next';

// Lazy: el modal solo se descarga cuando el jugador gana
const WinModal = lazy(() => import('../components/WinModal'));

const Conectar: React.FC = () => {
  const { t } = useTranslation();
  const [matchedCount, setMatchedCount]   = useState(0);
  const [draggedItem, setDraggedItem]     = useState<number | null>(null);
  const [matchedIds, setMatchedIds]       = useState<number[]>([]);
  const [gameWon, setGameWon]             = useState(false);
  const [leftItems, setLeftItems]         = useState<any[]>([]);
  const [rightItems, setRightItems]       = useState<any[]>([]);

  // Elemento "fantasma" que sigue el dedo en móvil
  const ghostRef      = useRef<HTMLDivElement | null>(null);
  const touchDragId   = useRef<number | null>(null);

  // ─── useMemo: no se reconstruyen en cada render ───────────
  const plasticTypes = useMemo(() => [
    { id: 1, name: t('pete_or_pet'),   img: '../../assets/pet.avif'   },
    { id: 2, name: t('hdpe_or_pehd'),  img: '../../assets/hdpe.avif'  },
    { id: 3, name: t('pvc_or_v'),      img: '../../assets/pvc.avif'   },
    { id: 4, name: t('ldpe_or_peld'),  img: '../../assets/ldpe.avif'  },
    { id: 5, name: 'PP',               img: '../../assets/pp.avif'    },
    { id: 6, name: 'PS',               img: '../../assets/ps.avif'    },
    { id: 7, name: t('other_or_o'),    img: '../../assets/other.avif' },
  ], [t]);

  const descriptions = useMemo(() => [
    { id: 1, description: t('used_for_packaging')  },
    { id: 2, description: t('found_in_detergent')  },
    { id: 3, description: t('used_in_plumbing')    },
    { id: 4, description: t('flexible_plastic_used')},
    { id: 5, description: t('used_in_food')        },
    { id: 6, description: t('found_in_disposable') },
    { id: 7, description: t('micellaneous_plastics')},
  ], [t]);

  // ─── Helpers ──────────────────────────────────────────────
  const shuffle = useCallback((arr: any[]) =>
    arr.slice().sort(() => Math.random() - 0.5), []);

  const tryMatch = useCallback((draggedId: number, targetId: number) => {
    if (draggedId !== targetId) return;
    setMatchedIds(prev => {
      const next = [...prev, targetId];
      setMatchedCount(next.length);
      if (next.length === plasticTypes.length) setGameWon(true);
      return next;
    });
  }, [plasticTypes.length]);

  const initializeGame = useCallback(() => {
    setLeftItems(shuffle(plasticTypes));
    setRightItems(shuffle(descriptions));
    setMatchedIds([]);
    setMatchedCount(0);
    setDraggedItem(null);
    setGameWon(false);
  }, [shuffle, plasticTypes, descriptions]);

  useEffect(() => { initializeGame(); }, []);

  // ─── Handlers drag (desktop) ──────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('text/plain', String(id));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem(id);
  }, []);

  const handleDragEnd = useCallback(() => setDraggedItem(null), []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const draggedId = Number(e.dataTransfer.getData('text/plain')) || draggedItem;
    if (draggedId == null) return;
    tryMatch(draggedId, targetId);
    setDraggedItem(null);
  }, [draggedItem, tryMatch]);

  // ─── Handlers touch (móvil) ───────────────────────────────
  // Creamos un div "fantasma" que sigue el dedo para dar
  // retroalimentación visual, y al soltar detectamos sobre
  // qué target cayó usando elementFromPoint.

  const removeGhost = () => {
    if (ghostRef.current) {
      ghostRef.current.remove();
      ghostRef.current = null;
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent, id: number, imgSrc: string) => {
    touchDragId.current = id;
    setDraggedItem(id);

    // Crear elemento fantasma
    const touch = e.touches[0];
    const ghost = document.createElement('div');
    ghost.style.cssText = `
      position: fixed;
      width: 60px; height: 60px;
      border-radius: 10px;
      background: rgba(255,255,255,0.9);
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      left: ${touch.clientX}px;
      top:  ${touch.clientY}px;
    `;
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.cssText = 'width:80%;height:80%;object-fit:contain;';
    ghost.appendChild(img);
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  }, []);

  // touchmove necesita passive:false para poder llamar preventDefault.
  // React lo registra como passive por defecto, así que lo adjuntamos
  // directo al DOM via useEffect sobre la sección izquierda.
  const leftSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = leftSectionRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (ghostRef.current) {
        ghostRef.current.style.left = `${touch.clientX}px`;
        ghostRef.current.style.top  = `${touch.clientY}px`;
      }
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    removeGhost();
    const id = touchDragId.current;
    touchDragId.current = null;
    setDraggedItem(null);
    if (id == null) return;

    const touch = e.changedTouches[0];

    // Ocultar el fantasma momentáneamente para que
    // elementFromPoint encuentre el target debajo
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!el) return;

    // Subir por el DOM hasta encontrar un elemento con data-target-id
    let node: Element | null = el;
    while (node) {
      const tid = node.getAttribute('data-target-id');
      if (tid) {
        tryMatch(id, Number(tid));
        return;
      }
      node = node.parentElement;
    }
  }, [tryMatch]);

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
          <div id="status">
            {t('matched')}: <span>{matchedCount}</span>/<span>{plasticTypes.length}</span>
          </div>
          <button onClick={initializeGame} className="conectar-btn-reset">{t('reset')}</button>
        </div>

        <main className="conectar-game">
          {/* ── Columna izquierda: plásticos ── */}
          <section ref={leftSectionRef} className="conectar-left" id="symbols" aria-label="plastic symbols">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, width: '100%' }}>
              {leftItems.map((plastic) => {
                if (matchedIds.includes(plastic.id)) return null;
                return (
                  <div
                    key={plastic.id}
                    className={`conectar-item ${draggedItem === plastic.id ? 'conectar-item--dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, plastic.id)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={(e) => handleTouchStart(e, plastic.id, plastic.img)}
                    onTouchEnd={handleTouchEnd}
                    aria-label={plastic.name}
                    style={{ touchAction: 'none' }}
                  >
                    <div className="conectar-icon" aria-hidden>
                      <IonImg
                        src={plastic.img}
                        alt={plastic.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <div className="conectar-name" style={{ fontSize: 9 }}>{plastic.name}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Columna derecha: descripciones ── */}
          <section className="conectar-right" id="targets" aria-label="descriptions">
            {rightItems.map((desc) => {
              const locked = matchedIds.includes(desc.id);
              return (
                <div
                  key={desc.id}
                  data-target-id={desc.id}   // usado por handleTouchEnd para identificar el target
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
                  <div
                    className="conectar-desc"
                    style={{ color: locked ? '#155724' : '#374151', fontSize: 13 }}
                    data-target-id={desc.id}  // también en el hijo por si el dedo cae aquí
                  >
                    {desc.description}
                  </div>
                </div>
              );
            })}
          </section>
        </main>
      </div>

      {/* Lazy: WinModal solo se carga cuando gameWon es true */}
      {gameWon && (
        <Suspense fallback={null}>
          <WinModal onReset={initializeGame} />
        </Suspense>
      )}
    </IonContent>
  );
};

export default Conectar;