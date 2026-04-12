import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            "AIzaSyCAT1dXIXi21v7bpgrfMpAzH6Myt0wMcc",
  authDomain:        "codesphere-ai.firebaseapp.com",
  projectId:         "codesphere-ai",
  storageBucket:     "codesphere-ai.firebasestorage.app",
  messagingSenderId: "906279114113",
  appId:             "1:906279114113:web:dbbb4e84067858a9480480",
};

const app = initializeApp(firebaseConfig);

export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();

provider.setCustomParameters({ prompt: "select_account" });