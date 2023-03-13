import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { socket } from "../../context/SessionContext";

type SessionType = {
  role: string;
  id: string;
  name: string;
};

const joinSession = (id: string, name: string, cb: any) => {
  socket.emit("join", { id, name }, (resp: any) => {
    cb(resp.session);
  });
};

const leaveSession = (id: string) => {
  console.log("leaving", id);
  socket.emit("leave", { id });
};

export function Session() {
  const { id } = useParams();
  const [sessionId, setSessionId] = React.useState<string>("");
  const [session, setSession] = React.useState<SessionType | null>(null);
  const logRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!id) return;

    const savedSessions = window.localStorage.getItem("sessions")
      ? JSON.parse(window.localStorage.getItem("sessions") as string)
      : null;

    let name = "";

    if (savedSessions) {
      const currentSavedSession = savedSessions.find((s) => s.id === id);

      console.log(currentSavedSession);

      name = currentSavedSession ? currentSavedSession.name : "";
    } else {
      console.log("no session");
    }

    joinSession(id, name, setSession);

    socket.on("event", (event: any) => {
      console.log(event);

      if (logRef.current) {
        let message = "";
        const { name, role } = event.user;
        switch (event.type) {
          case "USER_JOIN":
            message = `[${role}] &#60;${name}&#62; joined the session.`;
            break;
          case "USER_LEAVE":
            message = `[${role}] &#60;${name}&#62; left the session.`;
            break;
          case "USER_REJOIN":
            message = `[${role}] &#60;${name}&#62; rejoined the session.`;
            break;
        }

        logRef.current.innerHTML += `<p>${message}</p>`;
      }
    });

    console.log("onBeforeUnload");
    window.addEventListener("beforeunload", () => {
      leaveSession(id);
    });

    return () => {
      socket.emit("leave", { id });

      window.removeEventListener("beforeunload", () => leaveSession(id));
    };
  }, [id]);

  return (
    <div>
      <div>
        <input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          className="bg-slate-300"
        />
        <button onClick={() => navigate(`../session/${sessionId}`)}>
          Go to
        </button>
      </div>
      <h1>Session</h1>
      <p>ID: {id}</p>
      <p>Session ID: {JSON.stringify(session)}</p>
      <code ref={logRef} />
      <button onClick={() => leaveSession(id)}>Leave</button>
    </div>
  );
}
