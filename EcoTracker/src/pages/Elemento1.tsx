import { IonContent, IonHeader, IonBackButton, IonPage, IonButtons, IonTitle, IonToolbar, IonImg, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/react';
import { useTranslation } from 'react-i18next';
import './Elemento1.css';

interface ElData {
    num: number;
    name: string;
    img: string;
    desc: string;
}

function Elemento1() {
    const { t } = useTranslation();
    
    const EleData: ElData[] = [
        {
            num: 1,
            name: t('reduce_the_amount'),
            img: '../../assets/wastes.png',
            desc: t('reduce_text')
        },
        {
            num: 2,
            name: t('save_natural_resources'),
            img: '../../assets/resources.png',
            desc: t('save_text')
        },
        {
            num: 3,
            name: t('decrease_air'),
            img: '../../assets/pollution.png',
            desc: t('decrease_text')
        }, {
            num: 4,
            name: t('avoid_extracting'),
            img: '../../assets/reusing.png',
            desc: t('avoid_text')
        }, {
            num: 5,
            name: t('reduce_energy'),
            img: '../../assets/energy.png',
            desc: t('reduce_energy_text')
        }
    ];

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton className='back-button' defaultHref="/tabs/informacion" />
                    </IonButtons>
                </IonToolbar>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
            </IonHeader>


            <IonContent className="modern-content" fullscreen>
                <div className="main-title">♻️ {t('importance_of_recycling')}</div>
                <div className="card-container">
                    {EleData.map((item) => (
                        <IonCard key={item.num} className="modern-card">
                            <IonImg src={item.img} alt={item.name} className="card-image" />
                            <IonCardHeader>
                                <IonCardTitle className="card-title">{item.name}</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent className="card-desc">{item.desc}</IonCardContent>
                        </IonCard>
                    ))}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Elemento1;