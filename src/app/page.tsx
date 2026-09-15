import HomePage from '@/app/landingpage';
import Navbar from '@/components/landingPageSckelenton/navbar';
import Footer from '@/components/landingPageSckelenton/foter';
import TrustBar from '@/components/landingPageSckelenton/trustbar';
import WhoItsFor from '@/components/landingPageSckelenton/whoItsFor';
import HowItWorks from '@/components/landingPageSckelenton/howItWorks';
import Features from '@/components/landingPageSckelenton/features';
import Showcase from '@/components/landingPageSckelenton/showcase';
import WhyLedger from '@/components/landingPageSckelenton/whyLeger';
import FAQ from '@/components/landingPageSckelenton/faq';
import FinalCta from '@/components/landingPageSckelenton/finalCta';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
      <Navbar />
      <HomePage />
      <TrustBar />
      <WhoItsFor />
      <Features />
      <HowItWorks />
      <Showcase />
      <WhyLedger />
      <FAQ />
      <FinalCta />
      <Footer />

    </div>
  );
}
