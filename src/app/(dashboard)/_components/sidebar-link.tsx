'use client';
import { cn } from '@/lib/utils';
import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';

interface Props extends LinkProps {
  className?: string;
  children?: React.ReactNode;
}

const SidebarLink = ({ href, className, children, ...rest }: Props) => {
  const pathname = usePathname();

  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'group-hover:font-medium flex items-center gap-2 py-2 rounded',
        isActive && 'bg-primary text-secondary font-medium',
        className
      )}
      {...rest}
    >
      {children}
    </Link>
  );
};

export default SidebarLink;
