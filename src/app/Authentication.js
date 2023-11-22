import { useTUPCID } from "@/app/Provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Authenticate = (Component) => {
  return (props) => {
    const { TUPCID } = useTUPCID();
    const router = useRouter();
    useEffect(() => {
      if (!TUPCID) {
        router.push("/Login");
      }
    }, [TUPCID, router]);

    return <Component {...props} />;
  };
};

export default Authenticate;
