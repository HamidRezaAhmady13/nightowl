"use client";

import Button from "../shared/Button";
// import { useCurrentUser } from "@/app/(protected)/hooks/useCurrentUser";
import UserDropdown from "./UserDropdown";
import SearchBar from "../search/SearchBar";
import AvatarImage from "../shared/AvatarImage";

//
import NotificationButton from "../notification/NotificationButton";
// import { useUnreadCount } from "@/app/(protected)/hooks/useUnreadCount";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import { useUnreadCount } from "@/features/hooks/useUnreadCount";

//

export default function Header() {
  const { data: currentUser } = useCurrentUser();
  const router = useRouter();
  const { data: unread = 0 } = useUnreadCount(currentUser?.id);

  if (!currentUser) return null;

  return (
    <header className="o-header z-[990] py-sm mb-xl px-md h-3xl fixed  u-bg-main top-0 left-0  w-full   ">
      <div className="m-user-wrapper group">
        {currentUser && (
          <>
            <Button
              className={` h-full gap-md max-w-96 mt-0 z-50`}
              size={"lg"}
              height={"lg"}
            >
              <div className="relative ">
                <AvatarImage
                  src={currentUser.avatarUrl || undefined}
                  alt={currentUser.username}
                  size={34}
                />
              </div>
              <span className="u-text-md">{currentUser.username} </span>
            </Button>

            <UserDropdown />
          </>
        )}
      </div>

      {currentUser && (
        <div className="ml-auto flex items-center gap-lg">
          <NotificationButton unread={unread > 0} href="/notifications" />

          <SearchBar className="h-2xl  " />
        </div>
      )}
    </header>
  );
}
