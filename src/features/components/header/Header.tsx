"use client";

import Button from "../shared/Button";
import { useCurrentUser } from "@/features/hooks/useCurrentUser";
import UserDropdown from "./UserDropdown";
import SearchBar from "../search/SearchBar";
import AvatarImage from "../shared/AvatarImage";

export default function Header() {
  const { data: currentUser } = useCurrentUser();
  if (!currentUser) return null;

  return (
    <header className="o-header mt-sm mb-xl px-md h-2xl  ">
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

      {currentUser && <SearchBar className="h-2xl" />}
    </header>
  );
}
