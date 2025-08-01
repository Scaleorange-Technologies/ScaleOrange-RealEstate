
// import React, { useState } from 'react';
// import GeojsonMap from './components/Maps/GeojsonMap';
// import SplashScreen from './components/Maps/SplashScreen';
// const App = () => {
//   const [showSplash, setShowSplash] = useState(true);

//   return showSplash ? (
//       <SplashScreen onFinish={() => setShowSplash(false)} />
//   ) : (
//       <GeojsonMap/>
//   );
// };


// export default App;



// import React, { useState, useEffect } from 'react';
// import { Preferences } from '@capacitor/preferences';
// import GeojsonMap from './components/Maps/GeojsonMap';
// import SplashScreen from './components/Maps/SplashScreen';
// import MobileLoginScreens from './components/Maps/LoginScreen';
// import HomeScreen from './components/Maps/HomeScreen';
// const App = () => {
//   const [showSplash, setShowSplash] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);
//   const [currentScreen, setCurrentScreen] = useState('home'); // Add this state

//   // Check if user has already completed onboarding
//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const { value } = await Preferences.get({ key: 'hasCompletedOnboarding' });
//       if (value === 'true') {
//         setIsAuthenticated(true);
//       }
//     } catch (error) {
//       console.log('Error checking auth status:', error);
//     } finally {
//       setIsCheckingAuth(false);
//     }
//   };

//   // Handle successful login/signup (user completed onboarding)
//   const handleAuthSuccess = async () => {
//     try {
//       // Store that user has completed onboarding
//       await Preferences.set({
//         key: 'hasCompletedOnboarding',
//         value: 'true'
//       });
//       setIsAuthenticated(true);
//       setCurrentScreen('home');
//     } catch (error) {
//       console.log('Error saving auth status:', error);
//       // Even if storage fails, let user proceed
//       setIsAuthenticated(true);
//       setCurrentScreen('home')
//     }
//   };

//   // Optional: Add method to reset onboarding (for testing/logout)
//   const resetOnboarding = async () => {
//     try {
//       await Preferences.remove({ key: 'hasCompletedOnboarding' });
//       setIsAuthenticated(false);
//     } catch (error) {
//       console.log('Error resetting onboarding:', error);
//     }
//   };

//   // Show loading while checking auth status
//   if (isCheckingAuth) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-blue-600 text-lg">Loading...</div>
//       </div>
//     );
//   }

//   // Show splash screen first
//   if (showSplash) {
//     return <SplashScreen onFinish={() => setShowSplash(false)} />;
//   }

//   // Show login screens if not authenticated (first time user)
//   if (!isAuthenticated) {
//     return <MobileLoginScreens onAuthSuccess={handleAuthSuccess} />;
//   }

//   // Show main app if authenticated
//   return <GeojsonMap />;
// };

// export default App;


import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import GeojsonMap from './components/Maps/GeojsonMap';
import SplashScreen from './components/Maps/SplashScreen';
import MobileLoginScreens from './components/Maps/LoginScreen';
import HomeScreen from './components/Maps/HomeScreen';

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Navigation state: "home" or "maps"
  const [currentScreen, setCurrentScreen] = useState('home');
  // Hold location data for map
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([17.4550, 78.3852]); // default Hyderabad

  // Check onboarding/auth status
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { value } = await Preferences.get({ key: 'hasCompletedOnboarding' });
      if (value === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  // Handle successful login/signup (user completed onboarding)
  const handleAuthSuccess = async () => {
    try {
      await Preferences.set({
        key: 'hasCompletedOnboarding',
        value: 'true'
      });
      setIsAuthenticated(true);
      setCurrentScreen('home');
    } catch (error) {
      setIsAuthenticated(true);
      setCurrentScreen('home');
    }
  };

  // Show loading while checking auth status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-blue-600 text-lg">Loading...</div>
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Show login screens if not authenticated (first time user)
  if (!isAuthenticated) {
    return <MobileLoginScreens onAuthSuccess={handleAuthSuccess} />;
  }

  // Show HomeScreen after login, before map
  if (isAuthenticated && currentScreen === 'home') {
    return (
      <HomeScreen
        setCurrentScreen={setCurrentScreen}
        setMapCenter={setMapCenter}
        setSelectedLocation={setSelectedLocation}
      />
    );
  }

  // Show GeojsonMap after location is selected
  if (isAuthenticated && currentScreen === 'maps') {
    return (
      <GeojsonMap
        mapCenter={mapCenter}
        selectedLocation={selectedLocation}
        setCurrentScreen={setCurrentScreen}
      />
    );
  }

  // fallback
  return <div>Unknown screen</div>;
};

export default App;