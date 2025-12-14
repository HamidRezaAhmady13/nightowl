// NotificationButton.tsx
import React from "react";
import { AiOutlineBell, AiFillBell } from "react-icons/ai";
import clsx from "clsx";
import Link from "next/link";
import { Url } from "next/dist/shared/lib/router/router";

type Props = {
  unread?: boolean;
  href: Url;
};

export default function NotificationButton({ unread = false, href }: Props) {
  return (
    <Link
      href={href}
      // onClick={onClick}
      aria-label={unread ? `${unread} unread notifications` : "Notifications"}
      className={clsx(
        "intent-invisible p-1 rounded",
        " focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ",
        "transition-colors duration-normal",
        " text-amber-800 hover:text-amber-900 ",
        " dark:text-cobalt-300 dark:hover:text-cobalt-200 "
      )}
    >
      {/* react-icons use currentColor when no color prop is passed */}
      {unread ? <AiFillBell size={24} /> : <AiOutlineBell size={24} />}
    </Link>
  );
}
