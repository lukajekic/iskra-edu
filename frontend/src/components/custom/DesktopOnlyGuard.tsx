import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const DesktopOnlyGuard = ({ children }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 800);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <Navigate to="/not-available-on-mobile" replace />;
    
  }

  return children;
};

export default DesktopOnlyGuard;