import React, { useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import OpenAI from "openai";
import './IA.css';
import { useTranslation } from 'react-i18next';

interface RespuestaIA {
  tipo?: string;
  ideas?: string[];
  [key: string]: any;
}

function IA() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [respuesta, setRespuesta] = useState<RespuestaIA | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);
  const [errorTexto, setErrorTexto] = useState<string | null>(null);

  const client = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
  });

  const extraerTipo = (obj: any): string => {
    const posiblesCampos = ['tipo', 'type', 'category', 'categoria', 'material', 'residuo'];
    for (const campo of posiblesCampos) {
      if (obj[campo] && typeof obj[campo] === 'string') {
        return obj[campo];
      }
    }
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].length > 0) {
        return obj[key];
      }
    }
    return "No especificado";
  };

  const analizarImagen = async (base64Image: string) => {
    setLoading(true);
    setErrorTexto(null);
    try {
      const response = await client.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: t('system_prompt') },
              { type: "image_url", image_url: { url: base64Image } }
            ],
          },
        ],
      });

      const rawContent = response.choices[0].message.content;
      if (!rawContent) throw new Error("No content");

      const cleanJsonString = rawContent.replace(/```json|```/g, "").trim();
      let objetoJson: any;
      try {
        objetoJson = JSON.parse(cleanJsonString);
      } catch (e) {
        throw new Error("Respuesta no es JSON válido: " + cleanJsonString);
      }

      console.log("JSON recibido:", objetoJson);

      const tipoValor = extraerTipo(objetoJson);
      const ideasArray = Array.isArray(objetoJson.ideas) ? objetoJson.ideas :
        (objetoJson.suggestions || []);

      setRespuesta({
        tipo: tipoValor,
        ideas: ideasArray.length ? ideasArray : ["No se generaron ideas"]
      });

    } catch (error: any) {
      console.error("Error:", error);
      setErrorTexto(error.message);
      setRespuesta(null);
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
        <div className='contenedor'>
          <h1 className='tituloIA'>{t('find_out')}</h1>
          <button onClick={seleccionarImagen} disabled={loading} className='btnIA'>
            {t('upload')}   {/* ← ya no muestra "Analizando..." */}
          </button>
          {imagen && <img src={imagen} className='fotoIA' alt="Uploaded" />}

          {errorTexto && (
            <div style={{ color: 'red', marginTop: '20px' }}>
              Error: {errorTexto}
            </div>
          )}

          {respuesta && (
            <div className='respuestaIA'>
              <p className='tipoIA' style={{ fontWeight: 'bold' }}>
                {t('type')}: {respuesta.tipo}
              </p>
              <div className='ideasIA'>
                <p>{t('ideas')}</p>
                <ul>
                  {respuesta.ideas?.map((idea, idx) => (
                    <li key={idx} style={{ marginBottom: '10px' }}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      </IonContent>
    </IonPage>
  );
}

export default IA;