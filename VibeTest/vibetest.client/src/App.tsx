import { isGuestMode } from '@/config/env';
import { GuestApp } from '@/guest/GuestApp';
import { FullApp } from '@/full/FullApp';

function App() {
  return isGuestMode ? <GuestApp /> : <FullApp />;
}

export default App;
