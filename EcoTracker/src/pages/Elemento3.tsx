import {
    IonContent,
    IonButtons,
    IonHeader,
    IonBackButton,
    IonPage,
    IonToolbar,
    IonImg,
} from '@ionic/react';
import './Elemento3.css';

interface PlasticData {
    id: number;
    name: string;
    fullName: string;
    description: string;
    img: string;
    color: string;
}

const plasticTypes: PlasticData[] = [
    {
        id: 1,
        name: "PETE or PET",
        fullName: "Polyethylene terephthalate",
        description:
            "Used for packaging bottles, food containers, and textiles. Common in disposable items. Recyclability: Widely recyclable.",
        img: '../../assets/pet.avif',
        color: '#4CB5F5'
    },
    {
        id: 2,
        name: "HDPE or PE-HD",
        fullName: "High-density polyethylene",
        description:
            "Found in detergent bottles, toys, and piping. Known for its strength and stiffness. Recyclability: Widely recyclable.",
        img: '../../assets/hdpe.avif',
        color: '#00BA88'
    },
    {
        id: 3,
        name: "PVC or V",
        fullName: "Polyvinyl chloride",
        description:
            "Used in plumbing, flooring, insulation, and vinyl records. Not often recycled. Recyclability: Rarely recycled.",
        img: '../../assets/pvc.avif',
        color: '#FFC300'
    },
    {
        id: 4,
        name: "LDPE or PE-LD",
        fullName: "Low-density polyethylene",
        description:
            "Flexible plastic used in bags, wraps, and squeezable bottles. Recyclability: Not commonly accepted in curbside recycling, but sometimes collected at grocery stores.",
        img: '../../assets/ldpe.avif',
        color: '#FF7F50'
    },
    {
        id: 5,
        name: "PP",
        fullName: "Polypropylene",
        description:
            "Used in food containers, caps, and packaging. Durable and heat-resistant. Recyclability: Increasingly accepted for recycling.",
        img: '../../assets/pp.avif',
        color: '#DDA15E'
    },
    {
        id: 6,
        name: "PS",
        fullName: "Polystyrene",
        description:
            "Found in disposable plates, cups, foam trays, and insulation. Recyclability: Rarely recycled.",
        img: '../../assets/ps.avif',
        color: '#FF6B6B'
    },
    {
        id: 7,
        name: "OTHER or O",
        fullName:
            "Miscellaneous plastics like acrylic, polycarbonate, and multilayers",
        description: "Used for mixed applications. Difficult to recycle. Recyclability: Varies – often not recyclable.",
        img: '../../assets/other.avif',
        color: '#A28BD4'
    },
];

const Elemento3: React.FC = () => (
    <IonPage>
        <IonHeader>
            <IonToolbar color="light">
                <IonButtons slot="start">
                    <IonBackButton className='back-button' defaultHref="/tabs/informacion" />
                </IonButtons>
            </IonToolbar>
        </IonHeader>
        <IonContent fullscreen className="plastic-info-content">
            <div className="header-gradient">
                <h1 className="main-title">♻️ Types of Plastic</h1>
                <p className="subtitle">Understand the plastic symbols to recycle better</p>
            </div>
            <div className="plastic-grid">
                {plasticTypes.map((plastic) => (
                    <div className="plastic-tile" key={plastic.id} style={{ borderColor: plastic.color }}>
                        <div className="symbol-img-wrapper">
                            <IonImg src={plastic.img} alt={plastic.name} className="symbol-img" />
                        </div>
                        <div className="tile-info">
                            <h2 style={{ color: plastic.color }}>{plastic.name}</h2>
                            <h3 className="chemical-name">{plastic.fullName}</h3>
                            <p className="description">{plastic.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </IonContent>
    </IonPage>
);

export default Elemento3;