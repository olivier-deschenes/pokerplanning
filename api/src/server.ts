import { Server } from "socket.io";
import * as crypto from "crypto";

const io = new Server(8080, {
    cors: {
        origin: "http://127.0.0.1:5173",
    }
});

type UserSession = {
    role: string;
    name: string;
    id: string;
}

const sessions = new Map<string, Map<string, UserSession>>();

io.on("connect", (socket) => {
    console.log(`connect ${socket.id}`);
    socket.on("add_session", (data, cb) => {
        console.log('add_session', data)

        const id = crypto.randomUUID();

        const users = new Map<string, UserSession>();

        users.set(socket.id, {role: "owner", name: data.name, id: crypto.randomUUID()});

        sessions.set(id, users);

        cb({id});
    })

    socket.on("join", (data, cb) => {
        console.log('join', data)

        const sessionId = data.id;

        if (!sessions.has(sessionId)) {
            cb({error: "Session not found"});
            return;
        }

        const session = sessions.get(sessionId);

        if (!session.has(socket.id)) {
            session.set(socket.id, {role: "user", name: data.name ?? 'anonymous', id: crypto.randomUUID()});
        }

        const userSession = session.get(socket.id);

        if(!io.sockets.adapter.rooms[sessionId]?.sockets[socket.id]) {
            socket.join(sessionId);
            io.to(sessionId).emit("event", {type: 'USER_JOIN', id: socket.id, user: userSession});
        } else {
            io.to(sessionId).emit("event", {type: 'USER_REJOIN', id: socket.id, user: userSession});
        }

        cb({session: {role: userSession, id: socket.id}});
    });

    socket.on("leave", (data, cb) => {
        console.log('leave', data)
        const sessionId = data.id;

        if (!sessions.has(sessionId)) {
            return;
        }

        const session = sessions.get(sessionId);

        const userSession = session.get(socket.id);

        if (!userSession) {
            return;
        }

        socket.leave(sessionId);

        io.to(sessionId).emit("event", {type: 'USER_LEAVE', id: socket.id, user: userSession});

        session.delete(socket.id);
    });

    socket.on("disconnect", () => {
        console.log(`disconnect ${socket.id}`);
    });
});
