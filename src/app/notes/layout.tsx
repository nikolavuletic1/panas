import Navbar from "./Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {" "}
      <Navbar />
      <main className="max-w-7xl m-auto p-4">{children} </main> 
    </>
  );
}
