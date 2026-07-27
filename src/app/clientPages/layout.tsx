import Navbar from '@/components/landingPageSckelenton/navbar';
import Footer from '@/components/landingPageSckelenton/foter';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="">
      <Navbar />
      <div className="px-6 py-8 pb-20 sm:px-10 md:pb-8">{children}</div>
      <Footer />
    </div>
  );
}