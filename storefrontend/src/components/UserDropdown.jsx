import { Link } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LayoutDashboard, LogOutIcon, PackageIcon, UserIcon } from "lucide-react"

import { useAuthStore } from "@/store/authStore"

const getProfileInitials = (profile) => {
  const firstName = profile?.first_name?.trim() || ""
  const lastName = profile?.last_name?.trim() || ""

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  if (firstName.length >= 2) {
    return firstName.slice(0, 2).toUpperCase()
  }

  if (firstName.length === 1) {
    return firstName[0].toUpperCase()
  }

  return ""
}

export function UserDropdown() {
const {logOut,profile,isAdmin}=useAuthStore()

const initials = getProfileInitials(profile)

  const handleLogout = () => {
    logOut()
    console.log("logout user")

             setTimeout(()=>{
          window.location.reload()
         },300)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-stone-100 dark:hover:bg-gray-800">
          <Avatar className="h-9 w-9 border border-stone-200 transition hover:border-primary">
            <AvatarFallback className="bg-[#8B5E3C] text-xs font-semibold uppercase tracking-wide text-white">
              {initials || <UserIcon className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/MyProfile" className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              Profile
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/orders" className="flex items-center gap-2">
              <PackageIcon className="h-4 w-4" />
              My Orders
            </Link>
          </DropdownMenuItem>

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-600 focus:text-red-600"
        >
          <LogOutIcon className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
