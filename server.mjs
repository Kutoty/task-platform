import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const secret = "demo-secret";
const root = dirname(fileURLToPath(import.meta.url));
const users = {
  admin: { password: "admin", role: "admin" },
  member: { password: "member", role: "member" },
};

export function createApp() {
  const tasks = [{ id: 1, title: "Review the rubric", owner: "admin" }];
  let nextId = 2;

  function sign(payload) {
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const sig = createHmac("sha256", secret).update(body).digest("base64url");
    return `${body}.${sig}`;
  }

  function readUser(req) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const expected = createHmac("sha256", secret).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(body, "base64url").toString());
  }

  return function handle(req, res) {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "POST" && url.pathname === "/api/login") {
      return readBody(req, (raw) => {
        const body = JSON.parse(raw || "{}");
        const user = users[body.username];
        if (!user || user.password !== body.password) return send(res, 401, { error: "Invalid login" });
        send(res, 200, { token: sign({ username: body.username, role: user.role }) });
      });
    }
    if (url.pathname === "/api/tasks" && req.method === "GET") {
      const user = readUser(req);
      if (!user) return send(res, 401, { error: "Sign in required" });
      const visible = user.role === "admin" ? tasks : tasks.filter((task) => task.owner === user.username);
      return send(res, 200, { tasks: visible });
    }
    if (url.pathname === "/api/tasks" && req.method === "POST") {
      const user = readUser(req);
      if (!user) return send(res, 401, { error: "Sign in required" });
      return readBody(req, (raw) => {
        const body = JSON.parse(raw || "{}");
        if (!body.title) return send(res, 400, { error: "Title required" });
        const task = { id: nextId++, title: body.title, owner: user.username };
        tasks.push(task);
        send(res, 201, { task });
      });
    }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(readFileSync(join(root, "public/index.html")));
      return;
    }
    send(res, 404, { error: "Not found" });
  };
}

function readBody(req, done) {
  const chunks = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => done(Buffer.concat(chunks).toString()));
}

function send(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

if (process.argv[1] && process.argv[1].endsWith("server.mjs")) {
  const port = Number(process.env.PORT || 3000);
  createServer(createApp()).listen(port, () => {
    console.log(`task board on http://localhost:${port}`);
  });
}
