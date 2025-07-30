
import React, { useState } from 'react';
import GeojsonMap from './components/Maps/GeojsonMap';
import SplashScreen from './components/Maps/SplashScreen';
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return showSplash ? (
      <SplashScreen onFinish={() => setShowSplash(false)} />
  ) : (
      <GeojsonMap/>
  );
};


export default App;



