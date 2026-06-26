import { headers } from 'next/headers';
import AdminMobile from '../components/mobile/AdminMobile';
import AdminDesktop from '../components/desktop/AdminDesktop';

export const metadata = {
  title: "Admin Dashboard | Mark Barber n Shop",
  description: "Dasbor manajemen internal Mark Barber n Shop. Kelola antrian dan pantau laporan keuangan.",
};

export default async function AdminPage() {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return <AdminMobile />;
  }

  return <AdminDesktop />;
}
