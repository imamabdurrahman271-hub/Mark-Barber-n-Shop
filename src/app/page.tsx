import { headers } from 'next/headers';
import HomeMobile from './components/mobile/HomeMobile';
import HomeDesktop from './components/desktop/HomeDesktop';

export const metadata = {
  title: "Mark Barber n Shop | Booking Online & Antrian Live",
  description: "Dapatkan layanan cukur, pengeritingan (perm), rambut gimbal (dreadlocks) terbaik. Reservasi jadwal online dan pantau nomor antrian Anda secara langsung.",
};

export default async function Page() {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return <HomeMobile />;
  }
  
  return <HomeDesktop />;
}
