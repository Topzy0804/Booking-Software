import HomePage from '@/app/landingpage';
import Navbar from '@/components/landingPageSckelenton/navbar';
import Footer from '@/components/landingPageSckelenton/foter';

export default function Home() {
  return (
    <div className="bg-zinc-50 font-sans dark:bg-black">
      <Navbar />
      <HomePage />
      <Footer />

    </div>
  );
}
