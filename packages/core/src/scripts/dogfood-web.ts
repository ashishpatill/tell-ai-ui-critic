import { captureUrl, diagnoseCapture } from "../index";

const capture = await captureUrl("http://localhost:3000");
const report = diagnoseCapture(capture);
const generic = report.findings.filter((f) => {
  const v = report.verdicts.find((x) => x.findingId === f.id);
  return (v?.verdict ?? f.verdictHint) === "generic";
});
const drift = report.findings.filter((f) => {
  const v = report.verdicts.find((x) => x.findingId === f.id);
  return (v?.verdict ?? f.verdictHint) === "drift";
});
console.log("total:", report.score.total);
console.log("generic:", generic.map((f) => f.detector));
console.log("drift:", drift.map((f) => f.detector));
console.log("measures score:", report.measures?.score);
