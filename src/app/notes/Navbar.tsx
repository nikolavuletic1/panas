'use client'
import Image from "next/image";
import Link from "next/link";
import logo from "@/app/assets/ai-chatbot-logo-panas.png";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddEditNoteDialog from "@/components/AddEditNoteDialog";
import ThemeToggleButton from "@/components/ThemeToggleButton";
import { dark } from '@clerk/themes'
import { useTheme } from "next-themes";
import AiChatButton from "@/components/AiChatButton";
const Navbar = () => {
const {theme} = useTheme()

const [showAddEditNoteDialog, setShowAddEditNoteDialog] = useState(false)

  return (
    <> 
    <div className="p-4 shadow">
      <div className="m-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <Link href="notes" className="flex items-center gap-1">
          <Image src={logo} alt="Panas logo" width={80} height={80} />
        </Link>
        <div className="flex items-center gap-2">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              baseTheme: (theme === "dark" ? dark : undefined),
              elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
            }}
          />
          <ThemeToggleButton />
          <Button onClick={()=>setShowAddEditNoteDialog(true)}>
            <Plus size={20} className="mr-2" />
            Add Notes
          </Button>
          <AiChatButton />

       
        </div>
      </div>
    </div>
    <AddEditNoteDialog open={showAddEditNoteDialog} setOpen={setShowAddEditNoteDialog} />
    </>
  );
};

export default Navbar;
