import Footer from "@/Components/Default fix/Footer";
import Header from "@/Components/Default fix/Header";
import Link from "next/link";

export default function Home() {
  return (
    <main className="d-flex justify-content-center align-items-center vh-100">
      <Header />
      <div className="row text-center">
        <Link href="/Login">LOGIN</Link>
        <Link href="/Login/Registration">Register</Link>
        <Link href="/Login/Password/ForgetPassword">Password</Link>
        <Link href="/Admin_Page">Admin LOGIN</Link>
        <Link href="/Faculty">Faculty</Link>
      </div>
      <Footer />
    </main>
  );
}
