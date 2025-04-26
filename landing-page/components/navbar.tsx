'use client';
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import "/styles/globals.css";

interface NavLink {
  name: string;
  target: string;
}

const Navbar = () => {
  const links: NavLink[] = [
    { name: "Home", target: "/" },
    { name: "Projects", target: "/projects" },
    { name: "Blog", target: "/blog" },
    { name: "Contact", target: "/#contact"},
    { name: "Resume", target: "https://drive.google.com/file/d/1y_VlkkFUaFXCCYF-WO-EDnCOfMHy_F90/view?usp=sharing"},
  ];
 
  // status of mobile menu
  const [open, setOpen] = useState<boolean>(false);
  
  const path: string = '/' + usePathname().split("/")[1];
  return (
      <nav className={`justify-between items-center transition-all duration-10 ${open ? "bg-grey-normal" : "bg-opacity-0 " } gap-x-4 gap-y-2 flex flex-row`}>  
      <Link href="/" className="text-2xl md:self-center md:pl-3 p-4 no-underline font-bold opacity-0 animate-fade-down" 
        style={{animationDelay: "300ms"}}
      >John Ling</Link>

      {/* desktop menu */} 
      <div className="hidden invisible md:flex md:visible p-4 opacity-0 animate-fade-down" 
            style={{animationDelay: "500ms"}}
      > 
        <NavbarMenu links={links} activeLink={path} handle_click={() => setOpen(false)}/>
      </div>
  
      {/* mobile menu */}
      <div 
        className={
          `absolute visible block md:invisible md:hidden top-12 w-full bg-grey-normal transition-all z-10 
          ease-in-out ${open ? 'duration-500 max-h-96 p-2 shadow-md' : ' duration-500 max-h-0 shadow-none'}`}
      >
        <div className={`transition-all ease-in-out ${open ? 'duration-500 opacity-100' : " duration-300 opacity-0 invisible"}`}>
          <NavbarMenu links={links} activeLink={path} handle_click={() => setOpen(false)}/>
        </div>
      </div>
    </nav>
  )
}

const NavbarMenu: React.FC<{links: NavLink[], activeLink: string, handle_click: () => void}> = ({links, activeLink, handle_click}) => {
  return (
    <ul className="flex flex-col md:flex-row gap-x-2 gap-y-2 md:gap-x-6 align-middle">
    {links.map((link: NavLink, i: number) => {
      return <li key={link.name} className="p-2" style={{animationDelay: `${(i + 1) * 150}ms`}}>
        <Link onClick={handle_click} 
          className={`no-underline w-screen md:w-auto ${link.target === activeLink ? "font-bold text-orange" : ""}`} 
          aria-current={link.target === activeLink ? "page" : undefined} href={link.target}
        >
          {link.name}
        </Link>
      </li>
    })}
    </ul>
  )
}

export default Navbar;