import { useChatStore } from './store/useChatStore';
import CoachChat from './pages/CoachChat';
import Login from './pages/Login';

function App() {
  const isAuthenticated = useChatStore((state) => state.isAuthenticated);

  // Dacă nu este logat, afișăm poarta de acces (Login/Register)
  if (!isAuthenticated) {
    return <Login />;
  }

  // Dacă este logat, intrăm în interfața principală
  return <CoachChat />;
}

export default function Root() {
  return <App />;
}