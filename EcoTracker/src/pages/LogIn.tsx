import React from 'react';
import { useState } from 'react';
import { IonContent, IonText, IonItem, IonCheckbox, IonHeader, IonPage, IonTitle, IonToolbar, IonTabs, IonTabBar, IonImg, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, IonFooter, IonButton, IonInput } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useHistory } from 'react-router-dom';
import { Route, Redirect } from 'react-router';
import ExploreContainer from '../components/ExploreContainer';
import './LogIn.css';
import { verificarCredenciales } from "../services/firebaseFunctions.js"
import { signInWithEmailAndPassword as loginUsuario } from "firebase/auth";
import { auth } from "../firebaseConfig";


const LogIn: React.FC = () => {

  const history = useHistory();
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(false);

  const irAMapa = () => {
    history.push('/tabs/mapa');
  };

  const handleLogin = async () =>{
        try{
            await loginUsuario(auth, usuario, contrasena);
            irAMapa();
        }catch(error: any){
            if(error.code === 'auth/user-notfound' || error.code === 'auth/wrong/-password'){
                alert("correo o contraseña incorrectos");
            }else{
                alert("Error al iniciar sesión")
            }
        }
    }

  return (
    <IonPage>
      <IonHeader>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet"></link>
      </IonHeader>
      <IonContent className='bck'>
        <div className='log'>
          <img src="../../assets/logoDraw.png" />
        </div>
        <div className='rectangulo'>
          <p className='welcome'>Bienvenido</p>
        </div>
        <p className='name'>Correo:</p>
        <div className='Nombre' /*SECCION DONDE SE INGRESA EL NOMBRE*/>
          <IonInput  /*DONDE SE INGRESA EL NOMBRE*/
            clearInput={true}
            fill='solid'
            id='InputNom'
            onIonInput={(e: any) => setUsuario(e.target.value)}
          ></IonInput>
        </div>
        <p className='pswd'>Contraseña:</p>
        <div className='Password' /*SECCION DONDE SE INGRESA EL NOMBRE*/>
          <IonInput  /*DONDE SE INGRESA EL NOMBRE*/
            clearInput={true}
            fill='solid'
            id='InputPswd'
            onIonInput={(e: any) => setContrasena(e.target.value)}

          ></IonInput>
        </div>
        <div>
          <IonButton className='logIn' onClick={handleLogin} >Iniciar sesión</IonButton>
        </div>
        <div className='alt'>
          <p className='text'>¿No tienes cuenta?</p>
          <a className='signUp' href="/signup">Regístrate</a>
        </div>
      </IonContent>
    </IonPage>
  );
};
export default LogIn;