import React, { useState } from 'react';
import { IonPage, IonContent, IonHeader } from '@ionic/react';
import OpenAI from "openai";
import './IA.css';
import { useTranslation } from 'react-i18next';

// Interfaz para la respuesta esperada de la IA
interface RespuestaIA {
  tipo: string;
  ideas: string[];
}

function IA() {
  const { t } = useTranslation(); // Movido al inicio para usar en analizarImagen

  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<RespuestaIA | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const analizarImagen = async (base64Image: string) => {
    setLoading(true);
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: t('system_prompt') },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
      });

      console.log("Respuesta de IA:", response.choices[0].message.content);
      let rawContent = response.choices[0].message.content;
      if (!rawContent) {
        throw new Error("La IA no devolvió contenido");
      }
      const cleanJsonString = rawContent.replace(/```json|```/g, "").trim();
      const objetoJson = JSON.parse(cleanJsonString) as RespuestaIA;
      console.log("JSON Limpio:", objetoJson);
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
        if (typeof reader.result === 'string') {
          setImagen(reader.result);
          analizarImagen(reader.result);
        }
      };
      reader.readAsDataURL(file);
    };

    input.click();
  };

  return (
    <IonPage>
      <IonContent className='fondo'>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
        <div className='fondo'>
          <div className='contenedor'>
            <h1 className='tituloIA'>{t('find_out')}</h1>
            <button onClick={seleccionarImagen} disabled={loading} className='btnIA'>
              {loading ? 'Analizando...' : t('upload')}
            </button>
            {imagen && <img src={imagen} className='fotoIA' alt="Uploaded" />}
            {respuesta && (
              <div className='respuestaIA'>
                <p className='tipoIA'>{t('type')}: {respuesta.tipo}</p>
                <div className='ideasIA'>
                  <p>{t('ideas')}</p>
                  <ul>
                    {respuesta.ideas.map((idea, index) => (
                      <li key={index} style={{ marginBottom: '10px' }}>
                        {idea}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default IA;