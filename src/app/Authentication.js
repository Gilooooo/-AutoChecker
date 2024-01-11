"use client";

import { useTUPCID } from "@/app/Provider";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

const Authenticate = (Component) => {
  return (props) => {
    const { TUPCID } = useTUPCID();
    const [delay, setDelay] = useState(true);

    useEffect(() => {
      if (TUPCID === '') {
        setDelay(false);
      } else {
        setDelay(false);
      }
    }, [TUPCID]);

    useEffect(() => {
      if (!delay) {
        if (!TUPCID) {
          redirect("/Login")
        }
      }
    }, [TUPCID, delay]);

    return !delay && <Component {...props} />;
  };
};

export default Authenticate;