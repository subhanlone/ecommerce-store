import Navbar from "@/components/customer/Navbar";
import Footer from "@/components/customer/Footer";

export default function CustomerLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
