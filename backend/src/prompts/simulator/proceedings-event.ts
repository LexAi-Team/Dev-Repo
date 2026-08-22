export function buildProceedingsPrompt(
  caseTitle: string,
  practiceArea: string,
  studentStrategy: string,
  stage: string
): string {
  return `Act as a Presiding High Court Judge / Senior Judicial Magistrate in Indian Courtroom Proceedings for the case: "${caseTitle}" (${practiceArea}).

The law student representing Counsel has just submitted the following legal position for stage "${stage}":
"${studentStrategy}"

Generate a realistic courtroom proceeding event (such as a Judicial Clarification Question, Opposing Counsel Objection, or Witness Testimony Contradiction).

Return in valid JSON format matching this exact shape:
{
  "speaker": "JUDGE" | "OPPOSING_COUNSEL" | "WITNESS",
  "speakerName": "Hon'ble Justice / Opposing Counsel Advocates",
  "statement": "Counsel, you argue that Exhibit A is inadmissible under Section 65B of the Evidence Act. How do you respond to the certificate submitted by the forensic examiner?",
  "legalChallenge": "Admissibility of electronic record under Indian Evidence Law",
  "suggestedFocus": "Address statutory compliance under Section 65B/BSA Section 63."
}`;
}
