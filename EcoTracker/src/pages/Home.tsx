import { IonButton, IonContent, IonCheckbox, IonHeader, IonItem, IonPage, useIonViewDidEnter, useIonViewWillEnter } from '@ionic/react';
import './Home.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { IonList, IonSelect, IonSelectOption } from '@ionic/react';
import { useEffect, useState, useRef } from 'react';
import { registrarSitio } from "../services/firebaseFunctions.js";
import { obtenerSitios, agregarSitio, obtenerFavoritos, quitarSitio } from "../services/firebaseFunctions";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

// Iconos personalizados
import customMarkerIcon from '../img/point.png';
import customMarkerIcon2 from '../img/point1.png';

// Fix para iconos de Leaflet
const customIcon = new L.Icon({
  iconUrl: customMarkerIcon,
  iconSize: [50, 50],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

const currentIcon = new L.Icon({
  iconUrl: customMarkerIcon2,
  iconSize: [50, 50],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41],
});

// Tipo para los puntos de reciclaje
interface RecyclingSite {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  bussinessHours: string;
  materials: string[];
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  instructions: string;
  facilities: string;
  contact: string;
  photo?: string;
}

function arraysAreEqual(a: RecyclingSite[], b: RecyclingSite[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id) return false;
  }
  return true;
}

function UpdateVisibleMarkers({ markers, setVisibleMarkers }: { markers: RecyclingSite[], setVisibleMarkers: React.Dispatch<React.SetStateAction<RecyclingSite[]>> }) {
  const map = useMap();

  useEffect(() => {
    function update() {
      const bounds = map.getBounds();
      const visibles = markers
        .filter(marker => marker && typeof marker.lat === 'number' && typeof marker.lon === 'number')
        .filter(marker => bounds.contains([marker.lat, marker.lon]));
      setVisibleMarkers(prev => arraysAreEqual(prev, visibles) ? prev : visibles);
    }

    update();
    map.on('moveend', update);

    return () => {
      map.off('moveend', update);
    };
  }, [map, markers, setVisibleMarkers]);

  return null;
}

const Home: React.FC = () => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddSite, setShowAddSite] = useState(false);
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<string[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [visibleMarkers, setVisibleMarkers] = useState<RecyclingSite[]>([]);
  const markerRefs = useRef<{ [key: string]: L.Marker | null }>({});
  const [favoritesSet, setFavoritesSet] = useState<Set<string>>(new Set());
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newLat, setNewLat] = useState<string>('');
  const [newLon, setNewLon] = useState<string>('');
  const [newBussinessHours, setNewBussinessHours] = useState('');
  const [newMaterials, setNewMaterials] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newFacilities, setNewFacilities] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newMonday, setNewMonday] = useState(false);
  const [newTuesday, setNewTuesday] = useState(false);
  const [newWednesday, setNewWednesday] = useState(false);
  const [newThursday, setNewThursday] = useState(false);
  const [newFriday, setNewFriday] = useState(false);
  const [newSaturday, setNewSaturday] = useState(false);
  const [newSunday, setNewSunday] = useState(false);
  const [markers, setMarkers] = useState<RecyclingSite[]>([]);
  const [currentLanguageCode, setCurrentLanguageCode] = useState('es');

  const auth = getAuth();
  const history = useHistory();
  const { i18n, t } = useTranslation();

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario autenticado en Home:", user.email);
        setUsuarioId(user.uid);
      } else {
        console.log("No hay usuario autenticado, redirigiendo...");
        history.push('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, history]);

  function FixMapResize() {
    const map = useMap();
    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }, [map]);
    return null;
  }

  const [hasCentered, setHasCentered] = useState(false);
  function SetViewOnUser({ position }: { position: [number, number] }) {
    const map = useMap();
    useEffect(() => {
      if (!hasCentered && position) {
        map.setView(position, map.getZoom());
        setHasCentered(true);
      }
    }, [position, hasCentered, map]);
    return null;
  }

  // CORRECCIÓN: useIonViewWillEnter no debe ser async directamente
  useIonViewWillEnter(() => {
    const init = async () => {
      const savedLanguage = cookies.get('i18next') || 'es';
      setCurrentLanguageCode(savedLanguage);
      if (i18n.language !== savedLanguage) {
        await i18n.changeLanguage(savedLanguage);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserPosition([position.coords.latitude, position.coords.longitude]);
            console.log('Ubicación obtenida');
          },
          (error) => {
            console.error('No se pudo obtener la ubicación:', error);
          }
        );
      }

      const cargarMarkers = async () => {
        const datosMarkers = await obtenerSitios();
        setMarkers(datosMarkers as RecyclingSite[]);
      };
      await cargarMarkers();
    };
    init();
  });

  useIonViewDidEnter(() => {
    const loadFavorites = async () => {
      if (!usuarioId) return;
      try {
        const favs = await obtenerFavoritos(usuarioId);
        setFavoritesSet(new Set(favs));
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      }
    };
    loadFavorites();
  });

  // Recargar favoritos cuando cambie el usuarioId
  useEffect(() => {
    const loadFavorites = async () => {
      if (!usuarioId) return;
      try {
        const favs = await obtenerFavoritos(usuarioId);
        setFavoritesSet(new Set(favs));
      } catch (error) {
        console.error("Error cargando favoritos:", error);
      }
    };
    loadFavorites();
  }, [usuarioId]);

  const toggleFavorite = async (marker: RecyclingSite) => {
    if (!usuarioId) {
      console.log("No hay usuario autenticado");
      return;
    }

    const newSet = new Set(favoritesSet);
    const wasFavorite = newSet.has(marker.id);
    wasFavorite ? newSet.delete(marker.id) : newSet.add(marker.id);
    setFavoritesSet(newSet);

    try {
      wasFavorite
        ? await quitarSitio(usuarioId, marker)
        : await agregarSitio(usuarioId, marker);
    } catch (error) {
      console.error("Error actualizando favoritos:", error);
      wasFavorite ? newSet.add(marker.id) : newSet.delete(marker.id);
      setFavoritesSet(newSet);
    }
  };

  const registroSitio = async () => {
    if (!newName || !newAddress || !newLat || !newLon) {
      alert('Por favor completa: Nombre, Dirección, Latitud y Longitud');
      return;
    }

    const latNum = parseFloat(newLat);
    const lonNum = parseFloat(newLon);
    if (isNaN(latNum) || isNaN(lonNum)) {
      alert('Latitud y Longitud deben ser números válidos');
      return;
    }

    const nuevoRegistro = {
      name: newName,
      address: newAddress,
      lat: latNum,
      lon: lonNum,
      bussinessHours: newBussinessHours,
      materials: newMaterials.split(',').map(mat => mat.trim()).filter(m => m),
      monday: newMonday,
      tuesday: newTuesday,
      wednesday: newWednesday,
      thursday: newThursday,
      friday: newFriday,
      saturday: newSaturday,
      sunday: newSunday,
      instructions: newInstructions,
      facilities: newFacilities,
      contact: newContact,
      photo: '/assets/logoDraw.png'
    };

    try {
      await registrarSitio(nuevoRegistro);
      const datosMarkers = await obtenerSitios();
      setMarkers(datosMarkers as RecyclingSite[]);
      // Limpiar formulario
      setNewName('');
      setNewAddress('');
      setNewLat('');
      setNewLon('');
      setNewBussinessHours('');
      setNewMaterials('');
      setNewInstructions('');
      setNewFacilities('');
      setNewContact('');
      setNewMonday(false);
      setNewTuesday(false);
      setNewWednesday(false);
      setNewThursday(false);
      setNewFriday(false);
      setNewSaturday(false);
      setNewSunday(false);
      setShowAddSite(false);
    } catch (error) {
      console.error('Error al registrar sitio:', error);
    }
  };

  return (
    <IonPage>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      <IonHeader>
        <div className='logo-header-home'>
          <img src="../../assets/Logo 2.png" alt="logo" />
        </div>
        <div className='logo-name-home'>
          <img src="../../assets/EcoTracker.png" alt="EcoTracker" />
        </div>
        <div className='div-header'>
        </div>
      </IonHeader>
      <IonContent fullscreen className='fondo'>
        <button className='button-panel'
          style={{
            right: showSidebar ? '41vw' : "3vw",
            transform: showSidebar ? 'scaleX(1)' : "scaleX(-1)",
          }}
          onClick={() => setShowSidebar((v) => !v)}
        >
          <img src="../../assets/display.png" alt="panel" />
        </button>
        <div style={{ height: '86vh', width: '100%', marginTop: '7vh', maxHeight: '93vh' }}>
          <MapContainer
            center={userPosition ?? [20.676417, -103.415056]}
            zoom={14}
            style={{ height: '93vh', width: '100%' }}
            attributionControl={true}
          >
            <FixMapResize />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {markers
              .filter(marker => marker && typeof marker.lat === 'number' && typeof marker.lon === 'number')
              .filter(marker =>
                materialesSeleccionados.length === 0 ||
                (marker.materials && marker.materials.some((mat: string) =>
                  materialesSeleccionados.includes(mat)
                ))
              )
              .map((marker) => (
                <Marker key={marker.id} position={[marker.lat, marker.lon]} icon={customIcon} ref={ref => { markerRefs.current[marker.id] = ref; }}>
                  <Popup>
                    <div className='popup-content' id='popup-content'>
                      <div className='popup-header'>
                        <p className='name-site'>{marker.name}</p>
                        <button
                          className='star'
                          onClick={() => toggleFavorite(marker)}
                        >
                          <img
                            src={favoritesSet.has(marker.id)
                              ? "/assets/star-filled.png"
                              : "/assets/star.png"}
                            alt="favorite"
                          />
                        </button>
                      </div>
                      <img src={marker.photo || '/assets/logo.png'} alt="site" />
                      <p>
                        <strong>{t('address')}: </strong>{marker.address || 'No address available.'}
                      </p>
                      <p>
                        <strong>{t('bussiness_hours')}: </strong>{marker.bussinessHours || 'No bussiness hours available.'}
                      </p>
                      <div className='div-days'>
                        {marker.sunday ? (<img src="../../assets/sundayopen.png" className='day-open' alt="sun" />) : (<img src="../../assets/sunday.png" className='day-icon' alt="sun" />)}
                        {marker.monday ? (<img src="../../assets/mondayopen.png" className='day-open' alt="mon" />) : (<img src="../../assets/monday.png" className='day-icon' alt="mon" />)}
                        {marker.tuesday ? (<img src="../../assets/tuesdayopen.png" className='day-open' alt="tue" />) : (<img src="../../assets/tuesday.png" className='day-icon' alt="tue" />)}
                        {marker.wednesday ? (<img src="../../assets/wednesdayopen.png" className='day-open' alt="wed" />) : (<img src="../../assets/wednesday.png" className='day-icon' alt="wed" />)}
                        {marker.thursday ? (<img src="../../assets/thursdayopen.png" className='day-open' alt="thu" />) : (<img src="../../assets/thursday.png" className='day-icon' alt="thu" />)}
                        {marker.friday ? (<img src="../../assets/fridayopen.png" className='day-open' alt="fri" />) : (<img src="../../assets/friday.png" className='day-icon' alt="fri" />)}
                        {marker.saturday ? (<img src="../../assets/saturdayopen.png" className='day-open' alt="sat" />) : (<img src="../../assets/saturday.png" className='day-icon' alt="sat" />)}
                      </div>
                      <p>
                        <strong>{t('materials')}: </strong>{marker.materials && marker.materials.join(', ')}.
                      </p>
                      <p>
                        <strong>{t('instructions')}: </strong>{marker.instructions || 'No specific instructions available.'}
                      </p>
                      <p>
                        <strong>{t('facilities')}: </strong>{marker.facilities || 'No information available.'}
                      </p>
                      <p>
                        <strong>{t('contact')}: </strong>{marker.contact || 'No contact available.'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            {userPosition && (
              <Marker position={userPosition} icon={currentIcon}>
                <Popup><div className='popup-youre-here'>{t('youre_here')}</div></Popup>
              </Marker>
            )}
            {userPosition && <SetViewOnUser position={userPosition} />}
            <UpdateVisibleMarkers markers={markers} setVisibleMarkers={setVisibleMarkers} />
          </MapContainer>
        </div>
        <button className='agregar-sitio' onClick={() => setShowAddSite(true)}>{t('add_site')}</button>
        {showAddSite && (
          <div className='form-agregar-sitio'>
            <div className='form-header'>
              <img src="../../assets/logoDraw.png" alt="Logo" className='form-logo' />
              <button className='form-close-button' onClick={() => setShowAddSite(false)}>
                <img src="../../assets/Cross.png" alt="Close" />
              </button>
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('name_site')}:</p>
              <input type='text' placeholder={t('name_site')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('latitude')}:</p>
              <input type='text' placeholder={t('latitude')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLat(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('longitude')}:</p>
              <input type='text' placeholder={t('longitude')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLon(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('business_hours')}:</p>
              <input type='text' placeholder={t('business_hours')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBussinessHours(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-days'>{t('days_open')}:</p>
              <div className='check-days'>
                <input type="checkbox" id="sunday" name="sunday" className='form-check' checked={newSunday} onChange={(e) => setNewSunday(e.target.checked)} />
                <label htmlFor="sunday">S</label>
                <input type="checkbox" id="monday" name="monday" className='form-check' checked={newMonday} onChange={(e) => setNewMonday(e.target.checked)} />
                <label htmlFor="monday">M</label>
                <input type="checkbox" id="tuesday" name="tuesday" className='form-check' checked={newTuesday} onChange={(e) => setNewTuesday(e.target.checked)} />
                <label htmlFor="tuesday">T</label>
                <input type="checkbox" id="wednesday" name="wednesday" className='form-check' checked={newWednesday} onChange={(e) => setNewWednesday(e.target.checked)} />
                <label htmlFor="wednesday">W</label>
                <input type="checkbox" id="thursday" name="thursday" className='form-check' checked={newThursday} onChange={(e) => setNewThursday(e.target.checked)} />
                <label htmlFor="thursday">T</label>
                <input type="checkbox" id="friday" name="friday" className='form-check' checked={newFriday} onChange={(e) => setNewFriday(e.target.checked)} />
                <label htmlFor="friday">F</label>
                <input type="checkbox" id="saturday" name="saturday" className='form-check' checked={newSaturday} onChange={(e) => setNewSaturday(e.target.checked)} />
                <label htmlFor="saturday">S</label>
              </div>
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('materials')}:</p>
              <input type='text' placeholder={t('materials')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMaterials(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('instructions')}:</p>
              <input type='text' placeholder={t('instructions')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewInstructions(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('facilities')}:</p>
              <input type='text' placeholder={t('facilities')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewFacilities(e.target.value)} />
            </div>
            <div className='div-form-input'>
              <p className='form-name'>{t('contact')}:</p>
              <input type='text' placeholder={t('contact')} className='form-input' onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewContact(e.target.value)} />
            </div>
            <button className='form-button-submit' onClick={registroSitio}>
              {t('add_site')}
            </button>
          </div>
        )}
        <div className={`panel${showSidebar ? '' : ' hidden'}`}>
          <div className='filter-div'>
            <p className='filters'>{t('filters')}</p>
            <button className='filter-button'
              onClick={() => setShowFilters((v) => !v)}
              style={{ transform: showFilters ? 'scaleY(1)' : "scaleY(-1)" }}>
              <img src="../../assets/filterbutton.png" alt="Close" />
            </button>
          </div>
          {showFilters && (
            <div className='filter-options'>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Paper')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Paper'] : prev.filter(m => m !== 'Paper')); }}> {t('paper')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Plastic')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Plastic'] : prev.filter(m => m !== 'Plastic')); }}> {t('plastic')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Cardboard')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Cardboard'] : prev.filter(m => m !== 'Cardboard')); }}> {t('cardboard')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('TetraPak')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'TetraPak'] : prev.filter(m => m !== 'TetraPak')); }}> {t('tetrapak')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Styrofoam')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Styrofoam'] : prev.filter(m => m !== 'Styrofoam')); }}> {t('styfoam')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Oil')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Oil'] : prev.filter(m => m !== 'Oil')); }}> {t('oil')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Metal')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Metal'] : prev.filter(m => m !== 'Metal')); }}> {t('metal')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Glass')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Glass'] : prev.filter(m => m !== 'Glass')); }}> {t('glass')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Electronics')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Electronics'] : prev.filter(m => m !== 'Electronics')); }}> {t('electronics')} </IonCheckbox>
              <IonCheckbox labelPlacement='end' className='checkbox' checked={materialesSeleccionados.includes('Batteries')} onIonChange={e => { const checked = e.detail.checked; setMaterialesSeleccionados(prev => checked ? [...prev, 'Batteries'] : prev.filter(m => m !== 'Batteries')); }}> {t('batteries')} </IonCheckbox>
            </div>
          )}
          <p className='visible-sites'>{t('visible_recycling_facilities')}</p>
          <div className='scrollable-content'>
            <ul className='ul-visible-sites'>
              {visibleMarkers
                .filter(marker =>
                  materialesSeleccionados.length === 0 ||
                  (marker.materials && marker.materials.some((mat: string) =>
                    materialesSeleccionados.includes(mat)
                  ))
                )
                .map((marker) => (
                  <li key={marker.id}
                    className='list-visible-markers'
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      const ref = markerRefs.current[marker.id];
                      if (ref) ref.openPopup();
                    }}>{marker.name}</li>
                ))}
            </ul>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;