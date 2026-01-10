import Link, { LinkProps } from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<LinkProps, "href"> {
  href: string; // Ensure href is always a string for our usage
  className?: string;
  // activeClassName is not directly supported by next/link in the same way
  // Consider using useRouter and comparing pathname for active states
  // pendingClassName is not applicable for next/link
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, href, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className)} // Simplified className handling for next/link
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };