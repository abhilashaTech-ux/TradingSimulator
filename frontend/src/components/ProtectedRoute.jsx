import {
  useAuth,
} from "../context/AuthContext";


function ProtectedRoute({
  children,
}) {

  const {
    currentUser,
  } = useAuth();


  if (!currentUser) {

    return null;

  }


  return children;

}


export default ProtectedRoute;