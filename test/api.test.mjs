import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { createApp } from "../server.mjs";

function listen(app) {
  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function call(base, path, options = {}) {
  const res = await fetch(base + path, options);
  return { status: res.status, body: await res.json() };
}

test("member cannot see the admin task", async () => {
  const server = await listen(createApp());
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;
  const login = await call(base, "/api/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "member", password: "member" }),
  });
  const listed = await call(base, "/api/tasks", {
    headers: { authorization: `Bearer ${login.body.token}` },
  });
  assert.equal(listed.body.tasks.length, 0);
  server.close();
});
