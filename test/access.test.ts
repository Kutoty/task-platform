import assert from "node:assert/strict";
import test from "node:test";
import { visibleTasks } from "../src/access.ts";

test("a member does not see the admin task", () => {
  const tasks = [{ id: 1, title: "Review the rubric", owner: "admin" }];
  assert.equal(visibleTasks("member", "member", tasks).length, 0);
  assert.equal(visibleTasks("admin", "admin", tasks).length, 1);
});
