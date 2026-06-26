import { headers } from 'next/headers';
import BookMobile from '../components/mobile/BookMobile';
import BookDesktop from '../components/desktop/BookDesktop';

export const metadata = {
  title: "Booking Online | Mark Barber n Shop",
  description: "Pesan jadwal potong rambut pria, pewarnaan rambut fashion, dreadlocks, perm dengan mudah secara online. Dilayani langsung oleh Bang Arif.",
};

export default async function BookPage() {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return <BookMobile />;
  }

  return <BookDesktop />;
}
