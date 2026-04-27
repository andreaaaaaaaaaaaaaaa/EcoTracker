import React from 'react';
import { useTranslation } from 'react-i18next';

interface WinModalProps {
  onReset: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ onReset }) => {
  const { t } = useTranslation();
  return (
    <div className="conectar-overlay">
      <div className="conectar-modal">
        <h2>{t('well_done')}</h2>
        <p>{t('you_matched')}</p>
        <button onClick={onReset} className="conectar-btn-reset">
          {t('play_again')}
        </button>
      </div>
    </div>
  );
};

export default WinModal;