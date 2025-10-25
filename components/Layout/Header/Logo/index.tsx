import Link from 'next/link'

const Logo: React.FC = () => {
  return (
    <Link href='/' className='text-3xl font-semibold'>
      <img src="/logo.png" width={130} height={130} alt="" />
    </Link>
  )
}

export default Logo