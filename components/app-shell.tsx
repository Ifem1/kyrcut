import Link from "next/link";
import { WalletButton } from "./wallet";
export function AppShell({title,children}:{title:string;children:React.ReactNode}){return <main><header><Link className="logo" href="/">KYRCUT<span>/</span></Link><nav><Link href="/circuits">Circuits</Link><Link href="/keeper">Trigger</Link><Link href="/audit">Audit</Link><Link href="/profile">Profile</Link></nav><WalletButton/></header><section className="route"><p className="eyebrow">KYRCUT / {title.toUpperCase()}</p><h1>{title}</h1>{children}</section></main>}
