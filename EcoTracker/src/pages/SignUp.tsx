import React from 'react';
import { IonContent, IonToggle, IonInput, IonCheckbox, IonHeader, IonPage, IonTitle, IonToolbar, IonTabs, IonTabBar, IonImg, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonFooter, IonButton } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';
import { registrarUsuario } from "../services/firebaseFunctions.js";
import { setDoc, doc } from "firebase/firestore";  //importamos la conexión
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword as registroUsuario } from "firebase/auth";
import { Route, Redirect } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './SignUp.css';


function SignUp() {

  const [error, setError] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const history = useHistory();

  const irALogIn = () => {
    history.push('/login');
  };

  const guardarUsuario = async () => {

   try {
    const userCredential = await registroUsuario(auth, usuario, contrasena);
    const user = userCredential.user;

     await setDoc (doc(db, "usuarios", user.uid), {
       usuario: usuario,
       nombre: nombre
     });

     //limpiamos los inputs
     setUsuario("");
     setContrasena("");
     setNombre("");

     irALogIn();

   } catch (e) {
     console.error("Error añadiendo el documento:", e);
   }
 };

  return (
    <IonPage>
      <IonHeader>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet"></link>
      </IonHeader>
      <IonContent className='fondo'>
        <div className='log'>
          <img src="../../assets/logoDraw.png" />
        </div>
        <div className='rectangulo'>
          <p className='text1'>Comencemos</p>
        </div>
        <p className='name-su'>Nombre:</p>
        <div className='Nombre' /*SECCION DONDE SE INGRESA EL NOMBRE*/>
          <IonInput  /*DONDE SE INGRESA EL NOMBRE*/
            clearInput={true}
            fill='solid'
            id='InputNom'
            color={'warning'}
            onIonChange={(e: any) => setNombre(e.target.value )}
          ></IonInput>
        </div>
        <p className='mail-su'>Correo:</p>
        <div className='Mail' /*SECCION DONDE SE INGRESA EL NOMBRE*/>
          <IonInput  /*DONDE SE INGRESA EL NOMBRE*/
            clearInput={true}
            fill='solid'
            id='InputMail'
            color={'warning'}
            onIonChange={(e: any) => setUsuario(e.target.value )}
          ></IonInput>
        </div>
        <p className='pswd2-su'>Contraseña:</p>
        <div className='Password2' /*SECCION DONDE SE INGRESA EL NOMBRE*/>
          <IonInput  /*DONDE SE INGRESA EL NOMBRE*/
            clearInput={true}
            fill='solid'
            id='InputPswd2'
            color={'warning'}
            onIonChange={(e: any) => setContrasena(e.target.value )}
          ></IonInput>
        </div>
        <div>
          <IonButton className='SignUp' onClick={guardarUsuario}>Regístrate</IonButton>
          {error === true &&
            <h1> Todos los datos son obligatorios</h1>
          }
        </div>


        <div className='alt-su'>
          <p className='text2-su'>¿Ya tienes una cuenta?</p>
          <a className='textLog-su' href="/logIn">Inicia sesión</a>
        </div>
      </IonContent>
    </IonPage>
  );
}
export default SignUp;