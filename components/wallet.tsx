"use client";
import { useState } from "react";
import { Wallet } from "lucide-react";
declare global { interface Window { ethereum?: { request(args:{method:string;params?:unknown[]}):Promise<string[]> } } }
export function WalletButton(){const [address,setAddress]=useState<string>();const [error,setError]=useState<string>();async function connect(){setError(undefined);if(!window.ethereum){setError("No injected wallet found");return}try{const [account]=await window.ethereum.request({method:"eth_requestAccounts"});await window.ethereum.request({method:"wallet_switchEthereumChain",params:[{chainId:"0xf22f"}]});setAddress(account)}catch{setError("Wallet connection was cancelled or Studionet is unavailable.")}}return <div title={error}><button className="wallet" onClick={connect}><Wallet size={15}/>{address?`${address.slice(0,6)}…${address.slice(-4)}`:"Connect wallet"}</button></div>}
