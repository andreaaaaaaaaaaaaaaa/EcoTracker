import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface AddSiteFormProps {
    onSubmit: (data: {
        name: string; address: string; lat: number; lon: number;
        bussinessHours: string; materials: string[]; instructions: string;
        facilities: string; contact: string;
        monday: boolean; tuesday: boolean; wednesday: boolean;
        thursday: boolean; friday: boolean; saturday: boolean; sunday: boolean;
        photo: string;
    }) => Promise<void>;
    onClose: () => void;
}

const AddSiteForm: React.FC<AddSiteFormProps> = ({ onSubmit, onClose }) => {
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [bussinessHours, setBH] = useState('');
    const [materials, setMaterials] = useState('');
    const [instructions, setInstr] = useState('');
    const [facilities, setFacil] = useState('');
    const [contact, setContact] = useState('');
    const [monday, setMonday] = useState(false);
    const [tuesday, setTuesday] = useState(false);
    const [wednesday, setWednesday] = useState(false);
    const [thursday, setThursday] = useState(false);
    const [friday, setFriday] = useState(false);
    const [saturday, setSaturday] = useState(false);
    const [sunday, setSunday] = useState(false);

    const handleSubmit = useCallback(async () => {
        if (!name || !address || !lat || !lon) {
            alert('Por favor completa: Nombre, Dirección, Latitud y Longitud');
            return;
        }
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);
        if (isNaN(latNum) || isNaN(lonNum)) {
            alert('Latitud y Longitud deben ser números válidos');
            return;
        }
        await onSubmit({
            name, address, lat: latNum, lon: lonNum, bussinessHours,
            materials: materials.split(',').map((m) => m.trim()).filter(Boolean),
            instructions, facilities, contact,
            monday, tuesday, wednesday, thursday, friday, saturday, sunday,
            photo: '/assets/logoDraw.png',
        });
    }, [
        name, address, lat, lon, bussinessHours, materials,
        instructions, facilities, contact,
        monday, tuesday, wednesday, thursday, friday, saturday, sunday,
        onSubmit,
    ]);

    const textFields = [
        { label: t('name_site'), val: name, setter: setName },
        { label: t('address'), val: address, setter: setAddress },
        { label: t('latitude'), val: lat, setter: setLat },
        { label: t('longitude'), val: lon, setter: setLon },
        { label: t('business_hours'), val: bussinessHours, setter: setBH },
        { label: t('materials'), val: materials, setter: setMaterials },
        { label: t('instructions'), val: instructions, setter: setInstr },
        { label: t('facilities'), val: facilities, setter: setFacil },
        { label: t('contact'), val: contact, setter: setContact },
    ];

    const checkboxFields = [
        { id: 'sunday', label: 'S', val: sunday, setter: setSunday },
        { id: 'monday', label: 'M', val: monday, setter: setMonday },
        { id: 'tuesday', label: 'T', val: tuesday, setter: setTuesday },
        { id: 'wednesday', label: 'W', val: wednesday, setter: setWednesday },
        { id: 'thursday', label: 'T', val: thursday, setter: setThursday },
        { id: 'friday', label: 'F', val: friday, setter: setFriday },
        { id: 'saturday', label: 'S', val: saturday, setter: setSaturday },
    ];

    return (
        <div className='form-agregar-sitio'>
            <div className='form-header'>
                <img src="../../assets/logoDraw.png" alt="Logo" className='form-logo' />
                <button className='form-close-button' onClick={onClose}>
                    <img src="../../assets/Cross.png" alt="Close" />
                </button>
            </div>

            {textFields.map(({ label, val, setter }) => (
                <div className='div-form-input' key={label}>
                    <p className='form-name'>{label}:</p>
                    <input
                        type='text'
                        placeholder={label}
                        className='form-input'
                        value={val}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value)}
                    />
                </div>
            ))}

            <div className='div-form-input'>
                <p className='form-days'>{t('days_open')}:</p>
                <div className='check-days'>
                    {checkboxFields.map(({ id, label, val, setter }) => (
                        <span key={id}>
                            <input
                                type="checkbox"
                                id={id}
                                name={id}
                                className='form-check'
                                checked={val}
                                onChange={(e) => setter(e.target.checked)}
                            />
                            <label htmlFor={id}>{label}</label>
                        </span>
                    ))}
                </div>
            </div>

            <button className='form-button-submit' onClick={handleSubmit}>
                {t('add_site')}
            </button>
        </div>
    );
};

export default AddSiteForm;