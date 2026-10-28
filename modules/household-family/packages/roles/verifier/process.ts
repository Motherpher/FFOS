import { evaluate, type VerificationInput } from "./checks.js";
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (data: string) => {
  input += data;
  if (input.length > 8000000) process.exit(2);
});
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input) as VerificationInput;
    process.stdout.write(JSON.stringify(evaluate(data)));
  } catch {
    process.stderr.write("Invalid verification input");
    process.exitCode = 2;
  }
});
