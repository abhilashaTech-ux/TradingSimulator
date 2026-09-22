import {
  useAuth,
} from "./context/AuthContext";


import AuthPage
  from "./components/AuthPage";


import Dashboard
  from "./components/Dashboard";


import ProtectedRoute
  from "./components/ProtectedRoute";



function App() {

  const {
    currentUser,
  } = useAuth();



  if (!currentUser) {

    return (
      <AuthPage />
    );

  }



  return (

    <ProtectedRoute>

      <Dashboard />

    </ProtectedRoute>

  );

}


export default App;