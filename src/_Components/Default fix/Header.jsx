"use client";
import Link from "next/link";

function Header(){
    return(
        <header className="position-fixed w-100 top-0">
            <Link href="/">
            <div className="custom-red py-1 px-sm-3 px-0">
                <img src="/TUPC-min.svg" alt="" height={80} width={100} className="custom-shadow-2"/>
            </div>
            </Link>
            
        </header>
    )
}
export default Header;