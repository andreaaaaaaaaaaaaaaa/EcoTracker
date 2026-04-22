import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Home from './pages/Home';
import Inicio from './pages/Inicio';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Tabs from './pages/Tabs';
import Cuenta from './pages/Cuenta';
import Informacion from './pages/Informacion';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
*/

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { Suspense } from 'react';

setupIonicReact();

const App: React.FC = () => (
  <Suspense fallback={<div>Cargando...</div>}>
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/inicio">
            <Inicio />
          </Route>
          <Route exact path="/logIn">
            <LogIn />
          </Route>
          <Route exact path="/SignUp">
            <SignUp />
          </Route>
          <Route path="/tabs" component={Tabs} />
          <Route exact path="/">
            <Redirect to="/logIn" />
          </Route>

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  </Suspense>
);

export default App;
