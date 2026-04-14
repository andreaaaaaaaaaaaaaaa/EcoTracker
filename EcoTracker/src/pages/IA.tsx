import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader } from '@ionic/react';
import OpenAI from "openai";
import './IA.css';
import { useTranslation } from 'react-i18next';

function IA() {
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<any>("")
  const [imagen, setImagen] = useState<string | null>(null)

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Best practice: use process.env.REACT_APP_OPENAI_API_KEY
    dangerouslyAllowBrowser: true
  });

  const analizarImagen = async (base64Image: string) => {
    setLoading(true);
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o", // Ensure you use a vision-capable model
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: t('system_prompt') },
              {
                type: "image_url",
                image_url: {
                  url: base64Image, // Must include data:image/jpeg;base64, prefix
                },
              },
            ],
          },
        ],
      });

      console.log("Respuesta de IA:", response.choices[0].message.content);
      let rawContent = response.choices[0].message.content;
      const cleanJsonString = rawContent!.replace(/```json|```/g, "").trim();
      const objetoJson = JSON.parse(cleanJsonString);
      setRespuesta(objetoJson);
      { console.log(respuesta?.ideas) }
      console.log("JSON Limpio:", objetoJson);
      // Convert the string into a real Javascript Object

      setRespuesta(objetoJson);

    } catch (error) {
      console.error("Error con OpenAI:", error);
    } finally {
      setLoading(false);
    }
  };

  const seleccionarImagen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result contains the base64 string
        setImagen(reader.result as any)
        analizarImagen(reader.result as string);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  const { t } = useTranslation();

  return (
    <IonPage>
      <IonContent className='fondo'>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet"></link>
        <div className='fondo'> 
        <div className='contenedor'>
        <h1 className='tituloIA'>{t('find_out')} </h1>
        <button onClick={seleccionarImagen} disabled={loading} className='btnIA'>
          {loading ? 'Analizando...' : t('upload')}
        </button>
        <img src={imagen ?? undefined} className='fotoIA' />
        <div className='respuestaIA'>
          <p className='tipoIA'>{t('type')}: {respuesta?.tipo}</p>
          <div className='ideasIA'>
          <p>{t('ideas')} </p>
          <ul>
            {respuesta?.ideas && respuesta.ideas.map((idea: any, index: number) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                {idea}
              </li>
            ))}
          </ul>
          </div>
        </div>
        </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default IA;
