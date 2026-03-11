import { useEffect, useState, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { initializeApp } from "firebase/app";
import { getRemoteConfig, fetchAndActivate, getBoolean, getValue, onConfigUpdate, activate, fetchConfig } from "firebase/remote-config";

const MaintenanceGuard = () => {


  const [maintenance, setMaintenance] = useState(false)
  const navigate = useNavigate()
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE,
  authDomain: "iskra-25383.firebaseapp.com",
  projectId: "iskra-25383",
  storageBucket: "iskra-25383.firebasestorage.app",
  messagingSenderId: "612507373448",
  appId: "1:612507373448:web:1705a34d911ebc3492f43d"
};
const app = initializeApp(firebaseConfig)
    const remoteconfig = getRemoteConfig(app)

  useEffect(()=>{
      
    remoteconfig.settings.minimumFetchIntervalMillis = 0

    fetchAndActivate(remoteconfig).then(()=>{
      console.log("inicijalni fetch:", getBoolean(remoteconfig, "maintenance"))
      setMaintenance(getBoolean(remoteconfig, "maintenance"))
    })


const unsubscribe = onConfigUpdate(remoteconfig, {
  next: async () => {
    await fetchAndActivate(remoteconfig); 
    console.log("Realtime update nakon fetcha:", getBoolean(remoteconfig, "maintenance"));
    setMaintenance(getBoolean(remoteconfig, "maintenance"))
  },
  error: (err) => {
    console.error("Remote Config Error:", err);
  },
  complete: () => {
    console.log("Config update stream completed.");
  }
});

      }, [])

      useEffect(()=>{

        if (maintenance === true) {
          if (window.location.pathname !== "/maintenance") {
            navigate("/maintenance", { replace: true });
          }
        } else if (maintenance === false) {
          if (window.location.pathname === "/maintenance") {
            navigate("/", { replace: true });
          }
        }
      }, [maintenance])





  return <Outlet />;
};

export default MaintenanceGuard;