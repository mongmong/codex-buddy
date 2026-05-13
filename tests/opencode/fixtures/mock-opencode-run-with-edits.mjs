#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);

// Handle --version specially so cli-detection treats us as installed AND we
// don't write fixed.js into the wrong directory (cli-detection invokes us
// without --dir).
if (args.includes("--version")) {
  process.stdout.write("mock-opencode-run-with-edits 0.0.0\n");
  process.exit(0);
}

if (args[0] === "session" && args[1] === "list") {
  process.stdout.write("[]\n");
  process.exit(0);
}

const dirFlag = args.indexOf("--dir");
if (dirFlag === -1 || !args[dirFlag + 1]) {
  process.stderr.write("mock-opencode-run-with-edits requires --dir\n");
  process.exit(2);
}

const dir = args[dirFlag + 1];
writeFileSync(join(dir, "fixed.js"), "// fixed by mock opencode\nfunction add(a, b) { return a + b; }\n");

const SESSION = "ses_mock_run_edits";
const MSG = "msg_mock_run_edits";
const events = [
  { type: "step_start", sessionID: SESSION, part: { type: "step-start", messageID: MSG } },
  {
    type: "text",
    sessionID: SESSION,
    part: {
      type: "text",
      messageID: MSG,
      sessionID: SESSION,
      text: "Created `fixed.js` with the corrected `add` function.",
    },
  },
  { type: "step_finish", sessionID: SESSION, part: { type: "step-finish", messageID: MSG } },
];
for (const e of events) process.stdout.write(JSON.stringify(e) + "\n");
process.exit(0);
