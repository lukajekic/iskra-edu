import { initializeApp } from "firebase/app";
import { getRemoteConfig, fetchAndActivate, getBoolean } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE,
  authDomain: "iskra-25383.firebaseapp.com",
  projectId: "iskra-25383",
  storageBucket: "iskra-25383.firebasestorage.app",
  messagingSenderId: "612507373448",
  appId: "1:612507373448:web:1705a34d911ebc3492f43d"
};

const app = initializeApp(firebaseConfig);
const remoteConfig = getRemoteConfig(app);

remoteConfig.settings.minimumFetchIntervalMillis = 5000; 

remoteConfig.defaultConfig = {
  "maintenance": false
};


export const checkMaintenanceMode = async () => {
  try {
    const activated = await fetchAndActivate(remoteConfig);
        const status = getBoolean(remoteConfig, "maintenance");
    
    return status;
  } catch (err) {
    console.error("Firebase Remote Config Error:", err);
    return false;
  }
};