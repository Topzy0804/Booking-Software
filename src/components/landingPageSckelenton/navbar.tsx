import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Navbar() {

  return (
    <div className="flex justify-between items-center font-mono w-full bg-white py-4 px-12">
      <div className="font-display text-2xl font-semibold text-moss">
        <span>◆</span>
        Topzy
      </div>

      <div className="">
        <nav>
          <ul className="flex gap-5 justify-center items-center">
            <li><Button className='hover:bg-moss px-6 py-6 rounded-full hover:text-white text-sm'><Link href="/">Home</Link></Button></li>
            <li><Button className='hover:bg-moss px-6 py-6 rounded-full hover:text-white text-sm'><Link href="/clientPages/for-business">For Businesses</Link></Button></li>
            <li><Button className='hover:bg-moss px-6 py-6 rounded-full hover:text-white text-sm'><Link href="/clientPages/for-client">For Client</Link></Button></li>
            <li><Button className='hover:bg-moss px-6 py-6 rounded-full hover:text-white text-sm'><Link href="/pricing">Pricing</Link></Button></li>
          </ul>
        </nav>
      </div>

      <div className='flex gap-4'>
        <Button className='border border-moss px-6 py-6 text-moss leading-tight bg-white text-sm'><Link href="/login">Sign In</Link></Button>
        <Button className='border border-white bg-moss px-6 py-6 text-white leading-tight text-sm'><Link href="/signup">Create your business</Link></Button>
      </div>
    </div>
  )
}
