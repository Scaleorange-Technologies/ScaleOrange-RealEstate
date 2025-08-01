import React, { useState } from 'react';

const MobileLoginScreens = ({ onAuthSuccess }) => {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      // Complete onboarding - no validation needed
      onAuthSuccess();
    }, 1000);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      // Complete onboarding - no validation needed
      onAuthSuccess();
    }, 1000);
  };

  const handleSkip = () => {
    // Allow users to skip directly to app
    onAuthSuccess();
  };

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        {/* Logo placeholder - replace with your app logo */}
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          {/* Map-like icon */}
          <div className="w-12 h-12 border-4 border-white rounded-full relative">
            <div className="absolute inset-2 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute top-2 left-2 w-1 h-1 bg-blue-600 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-blue-600 rounded-full"></div>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome To MapExplorer</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Discover amazing locations and explore<br />
          interactive maps
        </p>
        
        <button 
          onClick={() => setCurrentScreen('signup')}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold mb-3 hover:bg-blue-700 transition-colors transform hover:scale-105"
        >
          Get Started
        </button>
        
        <button 
          onClick={() => setCurrentScreen('login')}
          className="w-full bg-white border-2 border-blue-600 text-blue-600 py-4 rounded-2xl font-semibold mb-4 hover:bg-blue-50 transition-colors"
        >
          I Have An Account
        </button>
        
        <button 
          onClick={handleSkip}
          className="text-gray-500 text-sm hover:text-gray-700 transition-colors underline"
        >
          Skip for now
        </button>
      </div>
    </div>
  );

  const LoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
        {/* Back button */}
        <button 
          onClick={() => setCurrentScreen('welcome')}
          className="mb-4 text-gray-500 hover:text-gray-700 transition-colors flex items-center"
        >
          ← Back
        </button>
        
        {/* Logo placeholder */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-white rounded-full relative">
            <div className="absolute inset-1.5 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Welcome Back!</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Sign in to continue your map exploration
        </p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password "
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div className="text-right">
            <button type="button" className="text-blue-600 text-sm hover:text-blue-700 transition-colors">
              Forgot Password?
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Continue'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 text-sm mt-6 mb-4">
          Don't have an account? 
          <button 
            onClick={() => setCurrentScreen('signup')}
            className="text-blue-600 ml-1 hover:text-blue-700 transition-colors"
          >
            Sign Up
          </button>
        </p>
        
        <div className="text-center text-gray-400 text-sm mb-4">Or connect with</div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleSkip}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <span className="text-white text-sm font-bold">f</span>
          </button>
          <button 
            onClick={handleSkip}
            className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            <span className="text-white text-sm font-bold">t</span>
          </button>
          <button 
            onClick={handleSkip}
            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <span className="text-white text-sm font-bold">G</span>
          </button>
        </div>
        
        <div className="text-center mt-4">
          <button 
            onClick={handleSkip}
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Skip and explore maps
          </button>
        </div>
      </div>
    </div>
  );

  const SignupScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm">
        {/* Back button */}
        <button 
          onClick={() => setCurrentScreen('welcome')}
          className="mb-4 text-gray-500 hover:text-gray-700 transition-colors flex items-center"
        >
          ← Back
        </button>
        
        {/* Logo placeholder */}
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-white rounded-full relative">
            <div className="absolute inset-1.5 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 w-0.5 h-0.5 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Join MapExplorer</h2>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Create your account to get started
        </p>
        
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-4 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Getting Started...' : 'Continue'}
          </button>
        </form>
        
        <p className="text-center text-gray-500 text-sm mt-6 mb-4">
          Already have an account? 
          <button 
            onClick={() => setCurrentScreen('login')}
            className="text-blue-600 ml-1 hover:text-blue-700 transition-colors"
          >
            Sign In
          </button>
        </p>
        
        <div className="text-center text-gray-400 text-sm mb-4">Or connect with</div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={handleSkip}
            className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
          >
            <span className="text-white text-sm font-bold">f</span>
          </button>
          <button 
            onClick={handleSkip}
            className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            <span className="text-white text-sm font-bold">t</span>
          </button>
          <button 
            onClick={handleSkip}
            className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <span className="text-white text-sm font-bold">G</span>
          </button>
        </div>
        
        <div className="text-center mt-4">
          <button 
            onClick={handleSkip}
            className="text-gray-400 text-sm hover:text-gray-600 transition-colors"
          >
            Skip and explore maps
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {currentScreen === 'welcome' && <WelcomeScreen />}
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'signup' && <SignupScreen />}
    </div>
  );
};

export default MobileLoginScreens;