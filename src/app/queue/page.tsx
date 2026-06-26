import { headers } from 'next/headers';
import QueueMobile from '../components/mobile/QueueMobile';
import QueueDesktop from '../components/desktop/QueueDesktop';

export const metadata = {
  title: "Monitor Antrian Live | Mark Barber n Shop",
  description: "Pantau antrian secara realtime hari ini. Halaman otomatis ter-update saat pengerjaan cukur selesai.",
};

export default async function QueuePage() {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return <QueueMobile />;
  }

  return <QueueDesktop />;
}
