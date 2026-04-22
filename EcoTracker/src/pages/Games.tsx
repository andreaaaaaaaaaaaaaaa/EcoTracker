import { IonPage, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Games.css';
import { useTranslation } from 'react-i18next';

const Games: React.FC = () => {
  const { t } = useTranslation();
  return (
    <IonPage>
      <IonContent style={{ '--background': '#f0f0e8' } as any} className="menu">
        <div className="div-title">
          <h1 className='title-games'>{t('games')}</h1>
          <p className="lead">{t('choose')}</p>
        </div>

        <div className="grid">
          <a className="card-games" href="/tabs/memorama">
            <div className="title">{t('memory')}</div>
            <div className="info">{t('memory_text')}</div>
          </a>

          <a className="card-games" href="/tabs/conectar">
            <div className="title">{t('connect')}</div>
            <div className="info">{t('connect_text')}</div>
          </a>

          <a className="card-games" href="/tabs/preguntas">
            <div className="title">{t('clean')}</div>
            <div className="info">{t('clean_text')}</div>
          </a>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Games;