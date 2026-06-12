import { Navigate } from 'react-router-dom';

function Recommendations() {
  return <Navigate to="/account?tab=for-you" replace />;
}

export default Recommendations;
