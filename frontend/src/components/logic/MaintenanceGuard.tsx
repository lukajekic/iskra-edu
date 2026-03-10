import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { checkMaintenanceMode } from '../../utils/firebaseConfig.ts';
const MaintenanceGuard = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyStatus = async () => {
      const isMaint = await checkMaintenanceMode()
      console.log(isMaint)
      if (isMaint && location.pathname !== '/maintenance') {
        navigate('/maintenance', { replace: true });
      } 
      else if (!isMaint && location.pathname === '/maintenance') {
        navigate('/', { replace: true });
      }
      
      setLoading(false);
    };

    verifyStatus();
  }, [location.pathname, navigate])

  if (loading) return null;

  return <Outlet />;
};

export default MaintenanceGuard