import {
  IonButton, IonContent, IonCheckbox, IonHeader,
  IonItem, IonPage, useIonViewDidEnter, useIonViewWillEnter
} from '@ionic/react';
import './Home.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { IonList, IonSelect, IonSelectOption } from '@ionic/react';
import {
  useEffect, useState, useRef,
  useMemo, useCallback, lazy, Suspense
} from 'react';

import { registrarSitio } from "../services/firebaseFunctions.js";
import { obtenerSitios, agregarSitio, obtenerFavoritos, quitarSitio } from "../services/firebaseFunctions";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

import customMarkerIcon from '../img/point.png';
import customMarkerIcon2 from '../img/point1.png';

const AddSiteForm = lazy(() => import('../components/AddSiteForm'));

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

const CACHE_TTL_MS = 5 * 60 * 1000;

const siteCache = {
  data: null as RecyclingSite[] | null,
  timestamp: 0,
  isValid(): boolean {
    return this.data !== null && Date.now() - this.timestamp < CACHE_TTL_MS;
  },
  set(sites: RecyclingSite[]) {
    this.data = sites;
    this.timestamp = Date.now();
  },
  invalidate() {
    this.data = null;
    this.timestamp = 0;
  },
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function arraysAreEqual(a: RecyclingSite[], b: RecyclingSite[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]?.id !== b[i]?.id) return false;
  }
  return true;
}

function FixMapResize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function UpdateVisibleMarkers({
  markers,
  setVisibleMarkers,
}: {
  markers: RecyclingSite[];
  setVisibleMarkers: React.Dispatch<React.SetStateAction<RecyclingSite[]>>;
}) {
  const map = useMap();

  useEffect(() => {
    function update() {
      const bounds = map.getBounds();
      const visibles = markers
        .filter(m => m && typeof m.lat === 'number' && typeof m.lon === 'number')
        .filter(m => bounds.contains([m.lat, m.lon]));
      setVisibleMarkers(prev => (arraysAreEqual(prev, visibles) ? prev : visibles));
    }
    update();
    map.on('moveend', update);
    return () => { map.off('moveend', update); };
  }, [map, markers, setVisibleMarkers]);

  return null;
}

function SetViewOnUser({
  position,
  hasCentered,
  onCentered,
}: {
  position: [number, number];
  hasCentered: boolean;
  onCentered: () => void;
}) {
  const map = useMap();
  useEffect(() => {
    if (!hasCentered && position) {
      map.setView(position, map.getZoom());
      onCentered();
    }
  }, [position, hasCentered, map, onCentered]);
  return null;
}

const RADIO_KM = 5;

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
  const [hasCentered, setHasCentered] = useState(false);

  const [markers, setMarkers] = useState<RecyclingSite[]>([]);

  const auth = getAuth();
  const history = useHistory();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuarioId(user.uid);
      } else {
        history.push('/login');
      }
    });
    return () => unsubscribe();
  }, [auth, history]);

  const cargarMarkers = useCallback(async () => {
    if (siteCache.isValid()) {
      setMarkers(siteCache.data!);
      return;
    }
    const datos = await obtenerSitios();
    const sitios = datos as RecyclingSite[];
    siteCache.set(sitios);
    setMarkers(sitios);
  }, []);

  const cargarFavoritos = useCallback(async (uid: string) => {
    try {
      const favs = await obtenerFavoritos(uid);
      setFavoritesSet(new Set(favs));
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    }
  }, []);

  useIonViewWillEnter(() => {
    const init = async () => {
      const savedLanguage = cookies.get('i18next') || 'es';
      if (i18n.language !== savedLanguage) await i18n.changeLanguage(savedLanguage);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
          (err) => console.error('No se pudo obtener la ubicación:', err)
        );
      }

      await cargarMarkers();
    };
    init();
  });

  useIonViewDidEnter(() => {
    if (usuarioId) cargarFavoritos(usuarioId);
  });

  useEffect(() => {
    if (usuarioId) cargarFavoritos(usuarioId);
  }, [usuarioId, cargarFavoritos]);

  const markersCercanos = useMemo<RecyclingSite[]>(() => {
    if (!userPosition) return markers;
    return markers.filter(
      (m) =>
        m &&
        typeof m.lat === 'number' &&
        typeof m.lon === 'number' &&
        haversineKm(userPosition[0], userPosition[1], m.lat, m.lon) <= RADIO_KM
    );
  }, [markers, userPosition]);

  const markersFiltrados = useMemo<RecyclingSite[]>(() => {
    if (materialesSeleccionados.length === 0) return markersCercanos;
    return markersCercanos.filter(
      (m) =>
        m.materials &&
        m.materials.some((mat) => materialesSeleccionados.includes(mat))
    );
  }, [markersCercanos, materialesSeleccionados]);

  const visibleFiltrados = useMemo<RecyclingSite[]>(() => {
    if (materialesSeleccionados.length === 0) return visibleMarkers;
    return visibleMarkers.filter(
      (m) =>
        m.materials &&
        m.materials.some((mat) => materialesSeleccionados.includes(mat))
    );
  }, [visibleMarkers, materialesSeleccionados]);

  const toggleFavorite = useCallback(
    async (marker: RecyclingSite) => {
      if (!usuarioId) return;
      setFavoritesSet((prev) => {
        const next = new Set(prev);
        next.has(marker.id) ? next.delete(marker.id) : next.add(marker.id);
        return next;
      });
      try {
        const wasFav = favoritesSet.has(marker.id);
        wasFav
          ? await quitarSitio(usuarioId, marker)
          : await agregarSitio(usuarioId, marker);
      } catch (error) {
        console.error('Error actualizando favoritos:', error);
        // Revertir en caso de error
        setFavoritesSet((prev) => {
          const next = new Set(prev);
          next.has(marker.id) ? next.delete(marker.id) : next.add(marker.id);
          return next;
        });
      }
    },
    [usuarioId, favoritesSet]
  );

  const handleMaterialToggle = useCallback(
    (material: string, checked: boolean) => {
      setMaterialesSeleccionados((prev) =>
        checked ? [...prev, material] : prev.filter((m) => m !== material)
      );
    },
    []
  );

  const handleCentered = useCallback(() => setHasCentered(true), []);
  const handleToggleSidebar = useCallback(() => setShowSidebar((v) => !v), []);
  const handleToggleFilters = useCallback(() => setShowFilters((v) => !v), []);

  const resetForm = useCallback(() => setShowAddSite(false), []);

  const registroSitio = useCallback(async (data: {
    name: string; address: string; lat: number; lon: number;
    bussinessHours: string; materials: string[]; instructions: string;
    facilities: string; contact: string;
    monday: boolean; tuesday: boolean; wednesday: boolean;
    thursday: boolean; friday: boolean; saturday: boolean; sunday: boolean;
    photo: string;
  }) => {
    try {
      await registrarSitio(data);
      siteCache.invalidate();
      await cargarMarkers();
      setShowAddSite(false);
    } catch (error) {
      console.error('Error al registrar sitio:', error);
    }
  }, [cargarMarkers]);

  const handleMarkerClick = useCallback((markerId: string) => {
    const ref = markerRefs.current[markerId];
    if (ref) ref.openPopup();
  }, []);

  return (
    <IonPage>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        rel="stylesheet"
      />
      <IonHeader>
        <div className='logo-header-home'>
          <img src="../../assets/Logo 2.png" alt="logo" />
        </div>
        <div className='logo-name-home'>
          <img src="../../assets/EcoTracker.png" alt="EcoTracker" />
        </div>
        <div className='div-header' />
      </IonHeader>

      <IonContent fullscreen className='fondo'>
        <button
          className='button-panel'
          style={{
            right: showSidebar ? '41vw' : '3vw',
            transform: showSidebar ? 'scaleX(1)' : 'scaleX(-1)',
          }}
          onClick={handleToggleSidebar}
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

            {markersFiltrados.map((marker) => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lon]}
                icon={customIcon}
                ref={(ref) => { markerRefs.current[marker.id] = ref; }}
              >
                <Popup>
                  <div className='popup-content' id='popup-content'>
                    <div className='popup-header'>
                      <p className='name-site'>{marker.name}</p>
                      <button
                        className='star'
                        onClick={() => toggleFavorite(marker)}
                      >
                        <img
                          src={
                            favoritesSet.has(marker.id)
                              ? '/assets/star-filled.png'
                              : '/assets/star.png'
                          }
                          alt="favorite"
                        />
                      </button>
                    </div>
                    <img src={marker.photo || '/assets/logo.png'} alt="site" />
                    <p><strong>{t('address')}: </strong>{marker.address || 'No address available.'}</p>
                    <p><strong>{t('bussiness_hours')}: </strong>{marker.bussinessHours || 'No bussiness hours available.'}</p>
                    <div className='div-days'>
                      {marker.sunday ? <img src="../../assets/sundayopen.png" className='day-open' alt="sun" /> : <img src="../../assets/sunday.png" className='day-icon' alt="sun" />}
                      {marker.monday ? <img src="../../assets/mondayopen.png" className='day-open' alt="mon" /> : <img src="../../assets/monday.png" className='day-icon' alt="mon" />}
                      {marker.tuesday ? <img src="../../assets/tuesdayopen.png" className='day-open' alt="tue" /> : <img src="../../assets/tuesday.png" className='day-icon' alt="tue" />}
                      {marker.wednesday ? <img src="../../assets/wednesdayopen.png" className='day-open' alt="wed" /> : <img src="../../assets/wednesday.png" className='day-icon' alt="wed" />}
                      {marker.thursday ? <img src="../../assets/thursdayopen.png" className='day-open' alt="thu" /> : <img src="../../assets/thursday.png" className='day-icon' alt="thu" />}
                      {marker.friday ? <img src="../../assets/fridayopen.png" className='day-open' alt="fri" /> : <img src="../../assets/friday.png" className='day-icon' alt="fri" />}
                      {marker.saturday ? <img src="../../assets/saturdayopen.png" className='day-open' alt="sat" /> : <img src="../../assets/saturday.png" className='day-icon' alt="sat" />}
                    </div>
                    <p><strong>{t('materials')}: </strong>{marker.materials?.join(', ')}.</p>
                    <p><strong>{t('instructions')}: </strong>{marker.instructions || 'No specific instructions available.'}</p>
                    <p><strong>{t('facilities')}: </strong>{marker.facilities || 'No information available.'}</p>
                    <p><strong>{t('contact')}: </strong>{marker.contact || 'No contact available.'}</p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {userPosition && (
              <Marker position={userPosition} icon={currentIcon}>
                <Popup>
                  <div className='popup-youre-here'>{t('youre_here')}</div>
                </Popup>
              </Marker>
            )}

            {userPosition && (
              <SetViewOnUser
                position={userPosition}
                hasCentered={hasCentered}
                onCentered={handleCentered}
              />
            )}

            <UpdateVisibleMarkers
              markers={markersFiltrados}
              setVisibleMarkers={setVisibleMarkers}
            />
          </MapContainer>
        </div>

        <button className='agregar-sitio' onClick={() => setShowAddSite(true)}>
          {t('add_site')}
        </button>

        {showAddSite && (
          <Suspense fallback={<div className='form-loading'>Cargando formulario…</div>}>
            <AddSiteForm onSubmit={registroSitio} onClose={resetForm} />
          </Suspense>
        )}

        <div className={`panel${showSidebar ? '' : ' hidden'}`}>
          <div className='filter-div'>
            <p className='filters'>{t('filters')}</p>
            <button
              className='filter-button'
              onClick={handleToggleFilters}
              style={{ transform: showFilters ? 'scaleY(1)' : 'scaleY(-1)' }}
            >
              <img src="../../assets/filterbutton.png" alt="Close" />
            </button>
          </div>

          {showFilters && (
            <div className='filter-options'>
              {[
                ['Paper', t('paper')],
                ['Plastic', t('plastic')],
                ['Cardboard', t('cardboard')],
                ['TetraPak', t('tetrapak')],
                ['Styrofoam', t('styfoam')],
                ['Oil', t('oil')],
                ['Metal', t('metal')],
                ['Glass', t('glass')],
                ['Electronics', t('electronics')],
                ['Batteries', t('batteries')],
              ].map(([value, label]) => (
                <IonCheckbox
                  key={value}
                  labelPlacement='end'
                  className='checkbox'
                  checked={materialesSeleccionados.includes(value)}
                  onIonChange={(e) => handleMaterialToggle(value, e.detail.checked)}
                >
                  {label}
                </IonCheckbox>
              ))}
            </div>
          )}

          <p className='visible-sites'>{t('visible_recycling_facilities')}</p>
          <div className='scrollable-content'>
            <ul className='ul-visible-sites'>
              {visibleFiltrados.map((marker) => (
                <li
                  key={marker.id}
                  className='list-visible-markers'
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleMarkerClick(marker.id)}
                >
                  {marker.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;