import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

import Logo from "@/assets/logo.svg";

export default function Home() {
  return (
    <>
      <div className={"flex flex-col items-center justify-center h-screen"}>
        <h1 className={"text-6xl font-bold"}>CustomRP Web</h1>
        <p className={"text-md mt-2"}>
          Custom Discord Rich Presence, no download required!
        </p>
        <div className={"flex flex-row space-x-2 mt-4"}>
          <Link href={"/dashboard/settings"} className={"btn btn-secondary"}>
            Get Started
          </Link>
          <a
            href={"https://docs.mikn.dev/solutions/customrp"}
            className={"btn btn-primary"}
            target={"_blank"}
            rel={"noreferrer"}
          >
            Learn More
          </a>
        </div>
        <a
          href={"https://github.com/mikndotdev/customrp"}
          target={"_blank"}
          rel={"noreferrer"}
          className={"mt-5"}
        >
          <FaGithub size={30} />
        </a>
      </div>
      <footer className={"fixed bottom-5 w-full text-center"}>
        <div className={"flex flex-row justify-center items-center space-x-2"}>
          <p className={"text-lg font-bold"}>A</p>
          <a href={"https://mikn.dev"} target={"_blank"} rel={"noreferrer"}>
            <Image src={Logo} alt={"Mikn.dev Logo"} width={80} height={20} />
          </a>
          <p className={"text-lg font-bold"}>thing</p>
        </div>
      </footer>
    </>
  );
}
