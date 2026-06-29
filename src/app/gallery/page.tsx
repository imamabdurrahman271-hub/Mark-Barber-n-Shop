import { headers } from 'next/headers';
import GalleryMobile from '../components/mobile/GalleryMobile';
import GalleryDesktop from '../components/desktop/GalleryDesktop';

export const metadata = {
  title: "Lisensi & Sertifikasi | Mark Barber n Shop",
  description: "Lihat bukti keahlian dan sertifikasi profesional Bang Arif. Kualitas potongan rambut Anda dijamin oleh keahlian Advance dan berlisensi.",
};

export default async function GalleryPage() {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return <GalleryMobile />;
  }

  return <GalleryDesktop />;
}
