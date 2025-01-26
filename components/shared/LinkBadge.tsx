import { ExternalLink } from "lucide-react";
import Link from "next/link";

type LinkBadgeProps = {
  name: string;
  href: string;
  className: string;
};

const LinkBadge = ({ name, href, className }: LinkBadgeProps) => {
  return (
    <Link
      href={href}
      target="_blank"
      className={`inline-flex items-center gap-1 rounded-lg px-3 py-1 text-sm text-white ${className}`}
    >
      {name} <ExternalLink className="h-3 w-3" />
    </Link>
  );
};

export default LinkBadge;
