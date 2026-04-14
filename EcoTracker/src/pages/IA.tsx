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

  // Función mejorada para extraer el tipo del residuo (busca en varios campos)
  const extraerTipo = (obj: any): string => {
    const keywords = ['paper', 'cardboard', 'plast', 'vidrio', 'glass', 'metal', 'organico', 'battery', 'pilas', 'electronico'];
    const buscar = (data: any): string | null => {
      if (typeof data === 'string') {
        const lower = data.toLowerCase();
        if (keywords.some(kw => lower.includes(kw)) && lower.length > 2) {
          return data;
        }
        return null;
      }
      if (Array.isArray(data)) {
        for (const item of data) {
          const res = buscar(item);
          if (res) return res;
        }
        return null;
      }
      if (typeof data === 'object' && data !== null) {
        const camposPrioritarios = ['tipo', 'type', 'category', 'categoria', 'material', 'residuo', 'waste'];
        for (const campo of camposPrioritarios) {
          if (data[campo] && typeof data[campo] === 'string') {
            return data[campo];
          }
        }
        for (const key in data) {
          const res = buscar(data[key]);
          if (res) return res;
        }
      }
      return null;
    };
    const encontrado = buscar(obj);
    return encontrado || "No especificado";
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
      console.log("Tipo detectado:", tipoValor);

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
            {t('upload')}
          </button>
          {imagen && <img src={imagen} className='fotoIA' alt="Uploaded" />}
          {respuesta && (
            <div className='respuestaIA'>
              <p className='tipoIA'>{t('type')}: {respuesta.tipo}</p>
              <div className='ideasIA'>
                <p>{t('ideas')}</p>
                <ul>
                  {respuesta.ideas?.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {errorTexto && <p style={{ color: 'red' }}>{errorTexto}</p>}
        </div>
      </IonContent>
    </IonPage>
  );
}

export default IA;