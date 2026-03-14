import { Link } from "react-router-dom"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import testprofilepic from "../assets/testprofilepic.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOutIcon, PackageIcon, UserIcon } from "lucide-react"

export function UserDropdown() {
  const handleLogout = () => {
    console.log("logout user")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className=" relative h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 ">
          <Avatar className="h-9 w-9 border border-gray-200 hover:border-gray-900 transition">
            <AvatarImage src={testprofilepic} alt="User"/>
            {/*change the initials after getting name*/}
            <AvatarFallback>KI</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile" className="flex items-center gap-2">
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