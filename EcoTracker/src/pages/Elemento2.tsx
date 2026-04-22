import { IonContent, IonButtons, IonHeader, IonBackButton, IonPage, IonToolbar, IonTitle, IonImg } from '@ionic/react';
import './Elemento2.css';
import { useTranslation } from 'react-i18next';

interface BinData {
    color: string;
    name: string;
    img: string;
    desc: string;
}



// Divide los bins


const Elemento2: React.FC = () => {
    const { t } = useTranslation();

    const bins: BinData[] = [
        {
            color: '#1E90FF',
            name: t('paper_and_cardboard'),
            img: '../../assets/blue.png',
            desc: t('paper_and_cardboard_text')
        },
        {
            color: '#32CD32',
            name: t('glass'),
            img: '../../assets/green.png',
            desc: t('glass_text')
        },
        {
            color: '#FFD700',
            name: t('plastic_and_metal'),
            img: '../../assets/yellow.png',
            desc: t('plastic_and_metal_text')
        },
        {
            color: '#000000',
            name: t('general_waste'),
            img: '../../assets/black.png',
            desc: t('general_waste_text')
        },
        {
            color: '#8B4513',
            name: t('organic_waste'),
            img: '../../assets/brown.png',
            desc: t('organic_waste_text')
        },
        {
            color: '#FF6347',
            name: t('hazardous_waste'),
            img: '../../assets/red.png',
            desc: t('hazardous_waste_text')
        },
        {
            color: '#32CD32',
            name: t('recyclable_inorganic'),
            img: '../../assets/green.png',
            desc: t('recyclable_inorganic_text')
        },
        {
            color: '#000000',
            name: t('non_recyclable_inorganic'),
            img: '../../assets/black.png',
            desc: t('non_recyclable_inorganic_text')
        }, {
            color: '#8B0000',
            name: t('organics'),
            img: '../../assets/brown.png',
            desc: t('organic_waste_text2')
        }, {
            color: '#FF4500',
            name: t('hazardous_or_special'),

            img: '../../assets/red.png',
            desc: t('hazardous_or_text')
        }, {
            color: '#FFD700',
            name: t('plastic_only'),
            img: '../../assets/yellow.png',
            desc: t('plastic_only_text')
        }
    ];

    const binsBeforeMexico = bins.slice(0, 6);
    const binsAfterMexico = bins.slice(6);
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton className='back-button' defaultHref="/tabs/informacion" />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="timeline-content" fullscreen>
                <div className="main-title2">🗑️ {t('recycling_bins')}</div>
                <div className="timeline">
                    {binsBeforeMexico.map((bin, idx) => (
                        <div className="timeline-item" key={idx}>
                            <div className="timeline-dot" style={{ background: bin.color }} />
                            <div className="timeline-card" style={{ borderLeft: `10px solid ${bin.color}`, borderRight: `10px solid ${bin.color}` }}>
                                <IonImg src={bin.img} alt={bin.name} className="timeline-img" />
                                <div className="timeline-info">
                                    <h2 style={{ color: bin.color }}>{bin.name}</h2>
                                    <p>{bin.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className='title-mexico'>
                    {t('in_mexico')}:
                </div>
                <div className="timeline">
                    {binsAfterMexico.map((bin, idx) => (
                        <div className="timeline-item" key={idx + 6}>
                            <div className="timeline-dot" style={{ background: bin.color }} />
                            <div className="timeline-card" style={{ borderLeft: `10px solid ${bin.color}`, borderRight: `10px solid ${bin.color}` }}>
                                <IonImg src={bin.img} alt={bin.name} className="timeline-img" />
                                <div className="timeline-info">
                                    <h2 style={{ color: bin.color }}>{bin.name}</h2>
                                    <p>{bin.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </IonContent>
        </IonPage>
    );
}

export default Elemento2;