import { headers } from 'next/headers';
import AdminLoginMobile from '../../components/mobile/AdminLoginMobile';
import AdminLoginDesktop from '../../components/desktop/AdminLoginDesktop';

export const metadata = {
  title: "Masuk Admin | Mark Barber n Shop",
  description: "Masuk ke dasbor manajemen internal Mark Barber n Shop secara aman.",
};

export default async function AdminLoginPage() {
  const headerList = await headers();
  const deviceType = headerList.get('x-device-type') || 'desktop';

  if (deviceType === 'mobile') {
    return <AdminLoginMobile />;
  }

  return <AdminLoginDesktop />;
}
