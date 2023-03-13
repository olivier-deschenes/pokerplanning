import * as React from "react";
import { io } from "socket.io-client";

type SessionContextType = {
  id: string | null;
  setId: (id: string | null) => void;
};

const Context = React.createContext<SessionContextType | null>(null);
export const socket = io("ws://localhost:8080/", {});

socket.connect();

export const useSessionContext = (): SessionContextType => {
  const context = React.useContext(Context);
  if (!context) {
    throw new Error("useSessionContext must be used within a SessionContext");
  }

  return context;
};

export default function SessionContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [id, setId] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      socket.emit("leave", { id: "HEHE" });
      socket.disconnect();
      console.log("disconnected");
    };
  }, []);

  const value = React.useMemo<SessionContextType>(() => ({ id, setId }), [id]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
