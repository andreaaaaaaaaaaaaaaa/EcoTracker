import React from 'react';
import { IonContent, useIonRouter, IonPage, IonCard, IonCardContent, IonIcon } from '@ionic/react';
import { playCircle } from 'ionicons/icons';
import './Informacion.css';
import { useTranslation } from 'react-i18next';

const Informacion: React.FC = () => {
  const router = useIonRouter();
  const { t } = useTranslation();

  const temas = [
    {
      titulo: t('importance_of_recycling'),
      descripcion: t('in_this_lesson1'),
      imagen: 'assets/recycling1.png',
    },
    {
      titulo: t('recycling_bins'),
      descripcion: t('in_this_lesson2'),
      imagen: 'assets/recycling2.png',
    },
    {
      titulo: t('plastic_symbols'),
      descripcion: t('in_this_lesson3'),
      imagen: 'assets/recycling3.png',
    },
  ];

  return (
    <IonPage>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet"></link>
      <IonContent className="ion-padding" style={{ '--ion-background-color': '#F0F0E9' }}>
        <div className='learn'>
          <p className='temas'> {t('learn_to_recycle')}
          </p>
          <img src="../../assets/logoDraw.png" className='logoTemas' />
        </div>
        <div>
          {temas.map((tema, index) => (
            <IonCard
              key={index}
              button
              className="recycling-tema"
              onClick={() => {
                if (index === 0) {
                  router.push('/tabs/elemento/1', 'forward');
                } else if (index === 1) {
                  router.push('/tabs/elemento/2', 'forward');
                } else if (index === 2) {
                  router.push('/tabs/elemento/3', 'forward');
                } else {
                  router.push(`/tabs/elemento/${index + 1}`, 'forward');
                }
              }}
            >
              <div
                className="tema-background"
                style={{ backgroundImage: `url(${tema.imagen})` }}
              >
                <div className="overlay">
                  <IonCardContent className="text-content">
                    <h2>{tema.titulo}</h2>
                    <p>{tema.descripcion}</p>
                    <IonIcon icon={playCircle} className="play-icon" />
                  </IonCardContent>
                </div>
              </div>
            </IonCard>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Informacion;