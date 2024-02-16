import Image from "next/image";
import logo from "@/app/assets/ai-chatbot-logo-panas.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  
  const { userId} = auth();
  if (userId) redirect('/notes')

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="g-4 flex items-center">
        <Image src={logo} alt="panas logo" width={100} height={100} />
        <span className="text-4xl font-bold tracking-tight lg:text-5xl">
          <span style={{ color: "#0C747D" }}>P</span>ersonal
          <span style={{ color: "#0C747D" }}> A</span>i
          <span style={{ color: "#0C747D" }}> N</span>ote
          <span style={{ color: "#0C747D" }}> As</span>sistant
        </span>
      </div>
      <p className="max-w-prose text-center">
        Your note-taking just got easier with your personal AI chatbot
        assistant!
        <br />
        Simply input your notes and ask your assistant to retrieve them whenever
        required.
      </p>
      <Button size={"lg"} asChild>
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}
