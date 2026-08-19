import { OpenAI } from 'openai';
import { catchAsync, AppError } from '../middleware/errorHandler.js';
import logger from '../utils/logger.js';

// Database of category questions, checklists, and procedures for mockup purposes
const categoryData = {
  'Theft': {
    subIssues: ['Mobile Phone Theft', 'Vehicle Theft', 'House Burglary', 'Jewellery Theft', 'Cash Theft', 'Document Theft', 'Other'],
    questions: [
      { key: 'incident_date', text: 'When did it happen (date/time)?', type: 'datetime' },
      { key: 'location', text: 'Where did it happen?', type: 'select', options: ['Home', 'Public Place', 'Bus', 'Train', 'Office', 'Other'] },
      { key: 'know_suspect', text: 'Do you know the suspect?', type: 'boolean' },
      { key: 'imei_number', text: 'Do you have the IMEI number?', type: 'text' }
    ],
    checklist: {
      required: ['Aadhaar Card', 'Purchase Bill / Invoice', 'FIR Copy'],
      evidence: ['IMEI Number Certificate', 'Mobile Photos', 'CCTV Footage (if available)', 'Witness Details']
    },
    procedure: ['FIR Registration at Nearest Police Station', 'Police Investigation', 'Filing of Charge Sheet by Police', 'Court Trial in Criminal Court']
  },
  'Property Dispute': {
    subIssues: ['Land Ownership', 'House Ownership', 'Boundary Dispute', 'Illegal Occupation', 'Property Partition', 'Sale Agreement Dispute', 'Tenant Issue', 'Other'],
    questions: [
      { key: 'has_sale_deed', text: 'Do you have the Sale Deed?', type: 'boolean' },
      { key: 'has_patta', text: 'Is Patta available?', type: 'boolean' },
      { key: 'is_registered', text: 'Is the property registered?', type: 'boolean' }
    ],
    checklist: {
      required: ['Sale Deed', 'Patta', 'Encumbrance Certificate (EC)', 'Tax Receipt'],
      evidence: ['Property Photos', 'Survey Sketch', 'Property Partition Agreement', 'Prior Correspondence Notices']
    },
    procedure: ['Draft and Send Legal Notice to Opposing Party', 'Filing of Civil Suit (O.S.) in Civil Court', 'Hearings and Evidence Submission', 'Final Judgment and Decree']
  },
  'Marriage & Divorce': {
    subIssues: ['Mutual Divorce', 'Contested Divorce', 'Alimony/Maintenance', 'Child Custody', 'Other'],
    questions: [
      { key: 'marriage_date', text: 'When was the marriage registered?', type: 'date' },
      { key: 'has_children', text: 'Do you have children?', type: 'boolean' },
      { key: 'is_mutually_agreed', text: 'Is the divorce mutually agreed upon by both parties?', type: 'boolean' }
    ],
    checklist: {
      required: ['Marriage Certificate', 'Husband and Wife Identity Proofs', 'Marriage Photographs'],
      evidence: ['Alimony/Maintenance Demands Agreement', 'Custody Arrangement Documents', 'Mediation Reports (if any)']
    },
    procedure: ['Drafting Mutual or Contested Petition', 'Filing Petition in Family Court', 'Counseling / Mediation Sessions', 'First & Second Motion Hearings', 'Grant of Divorce Decree']
  },
  'Family Issues': {
    subIssues: ['Domestic Violence', 'Property Dispute (Inheritance)', 'Guardianship', 'Other'],
    questions: [
      { key: 'relationship', text: 'What is your relationship to the other party?', type: 'text' },
      { key: 'description', text: 'Please briefly describe the family dispute.', type: 'textarea' }
    ],
    checklist: {
      required: ['Family Relationship Certificates', 'Legal Heir Certificate (for Inheritance)', 'Identity Proofs'],
      evidence: ['Prior police complaints (for violence)', 'Medical records (if applicable)', 'Written communications / Wills']
    },
    procedure: ['Filing a petition in Family Court / Civil Court', 'Mediation and Reconciliation attempts', 'Formal Court Proceedings', 'Court Order or Settlement Decree']
  },
  'Assault': {
    subIssues: ['Physical Assault', 'Verbal Abuse/Threats', 'Harassment', 'Other'],
    questions: [
      { key: 'incident_time', text: 'When did the incident occur?', type: 'datetime' },
      { key: 'location', text: 'Where did it occur?', type: 'text' },
      { key: 'injured', text: 'Were you physically injured?', type: 'boolean' },
      { key: 'medical_done', text: 'Was a medical examination conducted?', type: 'boolean' }
    ],
    checklist: {
      required: ['Government Identity Proof', 'FIR Copy', 'Medical Certificate / Wound Certificate'],
      evidence: ['Photographs of Injuries', 'CCTV/Video recordings of the incident', 'Witness Statements']
    },
    procedure: ['Register FIR under relevant IPC/BNS Sections', 'Medical Examination / Police Panchnama', 'Arrest/Interrogation of accused', 'Criminal Prosecution Trial']
  },
  'Cyber Crime': {
    subIssues: ['Online Financial Fraud', 'Hacking/Phishing', 'Social Media Harassment', 'Identity Theft', 'Other'],
    questions: [
      { key: 'loss_amount', text: 'What is the financial loss amount (if any)?', type: 'number' },
      { key: 'platform', text: 'Which online platform was used? (e.g. WhatsApp, Email, Website)', type: 'text' },
      { key: 'has_screenshots', text: 'Do you have screenshots of the transaction/communication?', type: 'boolean' }
    ],
    checklist: {
      required: ['Identity Proof', 'Bank Statement showing fraudulent transactions', 'Complaint Acknowledgement'],
      evidence: ['Screenshots of chats/emails', 'Phishing links / IP logs', 'Transaction Reference receipts']
    },
    procedure: ['Filing online complaint at cybercrime.gov.in', 'Investigation by Cyber Police Wing', 'Bank Account Freezing (if financial)', 'Legal Prosecution']
  },
  'Road Accident': {
    subIssues: ['Hit and Run', 'Vehicle Damage', 'Personal Injury', 'Other'],
    questions: [
      { key: 'vehicle_number', text: 'Do you have the vehicle number of the other party?', type: 'text' },
      { key: 'police_informed', text: 'Was the police informed/FIR filed?', type: 'boolean' },
      { key: 'has_insurance', text: 'Do you have active vehicle insurance?', type: 'boolean' }
    ],
    checklist: {
      required: ['FIR Copy', 'Driving Licence', 'RC Book / Vehicle Registration', 'Insurance Policy Document'],
      evidence: ['Accident site photographs', 'Motor Vehicle Inspector (MVI) Report', 'Medical bills / Medical certificate']
    },
    procedure: ['Filing FIR at police station', 'Vehicle damage evaluation / MVI inspection', 'Filing claim in Motor Accident Claims Tribunal (MACT)', 'MACT Hearing and Compensation decree']
  },
  'Money Fraud': {
    subIssues: ['Investment Fraud', 'Unpaid Loan/Debt', 'Business Contract Dispute', 'Other'],
    questions: [
      { key: 'fraud_amount', text: 'What is the fraud/disputed amount?', type: 'number' },
      { key: 'has_written_contract', text: 'Do you have a written contract/agreement?', type: 'boolean' },
      { key: 'payment_method', text: 'What was the payment method?', type: 'text' }
    ],
    checklist: {
      required: ['Identity Proof', 'Agreement / Promissory Note', 'Bank statements showing transactions'],
      evidence: ['WhatsApp / Email chats regarding repayment', 'Receipts of payments', 'Bounced Cheque & Cheque Return Memo (if applicable)']
    },
    procedure: ['Send Legal Demand Notice under Sec 138 (if cheque) or Civil Demand', 'Filing Summary Suit or Criminal Complaint', 'Mediation / Arbitration hearings', 'Execution of Decree']
  },
  'Women Safety': {
    subIssues: ['Workplace Harassment', 'Stalking', 'Domestic Abuse', 'Other'],
    questions: [
      { key: 'incident_type', text: 'Please describe the incident type briefly.', type: 'textarea' },
      { key: 'police_complained', text: 'Have you filed a complaint with the police or internal committee?', type: 'boolean' }
    ],
    checklist: {
      required: ['Identity Proof', 'FIR copy / Complaint copy', 'Internal Complaints Committee (ICC) report (if workplace)'],
      evidence: ['Threatening calls recordings / texts', 'Incident photos/videos', 'Witness statements']
    },
    procedure: ['Lodging FIR under special acts / IPC / BNS', 'Statement recording before Magistrate (Sec 164)', 'Fast-track investigation and safety protection orders', 'Court prosecution trial']
  },
  'Other': {
    subIssues: ['General Legal Query', 'Contract Review', 'Other'],
    questions: [
      { key: 'description', text: 'Please describe your legal issue in detail.', type: 'textarea' }
    ],
    checklist: {
      required: ['Government Identity Proof', 'Primary documentation related to the query'],
      evidence: ['Supporting letters / emails / communications']
    },
    procedure: ['Consultation with Legal Counsel / Advocate', 'Drafting of appropriate legal representations', 'Filing of representations or suits as advised']
  }
};

// Initialize OpenAI client dynamically
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey && apiKey !== 'your-api-key-here' && apiKey.trim() !== '') {
    return new OpenAI({ apiKey });
  }
  return null;
};

const SYSTEM_SAFETY_PROMPT = "You are an assistive legal tool for Indian judiciary context. Never predict outcomes, determine guilt, or replace professional legal advice. All guidance is informational only.";

// Endpoint to fetch questions & subissues for a category
const getQuestionsByCategory = catchAsync(async (req, res) => {
  const category = req.query.category || req.params.category;
  if (!category || !categoryData[category]) {
    throw new AppError('Legal category not found or unsupported', 404);
  }
  res.json({ category, subIssues: categoryData[category].subIssues, questions: categoryData[category].questions });
});

// Generate summary via OpenAI (with mock fallback)
const generateSummary = catchAsync(async (req, res) => {
  const { category, sub_issue, answers } = req.body;

  if (!category || !answers) {
    throw new AppError('Missing required parameters: category, answers', 400);
  }

  const subIssueStr = sub_issue || 'General';
  const answersFormatted = typeof answers === 'object' ? JSON.stringify(answers) : String(answers);
  const disclaimer = 'Disclaimer: This summary is AI-generated based entirely on citizen responses. It is intended for assistance only and must be verified by an advocate.';

  const openai = getOpenAIClient();
  if (openai) {
    try {
      const userPrompt = `You are a legal assistant helping a citizen. The user has a ${category} issue involving ${subIssueStr}. Their answers are: ${answersFormatted}. Write a plain-language summary of their situation in 3-4 sentences. Do not give legal advice. Do not predict outcomes.`;
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_SAFETY_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.5
      });

      const summaryText = completion.choices[0]?.message?.content?.trim() || '';
      return res.json({ category, sub_issue: subIssueStr, summary: summaryText, ai_summary: summaryText, disclaimer });
    } catch (error) {
      logger.warn('[OpenAI Fallback] Failed to call OpenAI generateSummary, using mock data:', { message: error.message });
    }
  }

  // Fallback mock logic
  let summaryText = '';
  const answersMap = {};
  if (typeof answers === 'object' && !Array.isArray(answers)) {
    Object.assign(answersMap, answers);
  } else if (Array.isArray(answers)) {
    answers.forEach(a => { if (a.question_key) answersMap[a.question_key] = a.answer_value; });
  }

  if (category === 'Theft') {
    const date = answersMap.incident_date || 'an unspecified date';
    const loc = answersMap.location || 'an unknown location';
    const suspect = answersMap.know_suspect === 'true' || answersMap.know_suspect === true ? 'is known' : 'is unknown';
    const imei = answersMap.imei_number ? ` (IMEI: ${answersMap.imei_number})` : '';
    summaryText = `The citizen reports that a theft of '${subIssueStr}' occurred on ${date} at ${loc}. The suspect ${suspect}. Stolen item details${imei}.`;
  } else if (category === 'Property Dispute') {
    const deed = answersMap.has_sale_deed === 'true' || answersMap.has_sale_deed === true ? 'possesses' : 'does not possess';
    const patta = answersMap.has_patta === 'true' || answersMap.has_patta === true ? 'is' : 'is not';
    const reg = answersMap.is_registered === 'true' || answersMap.is_registered === true ? 'registered' : 'unregistered';
    summaryText = `Property dispute concerning '${subIssueStr}'. The citizen ${deed} the Sale Deed. Patta ${patta} available. The property is currently ${reg}.`;
  } else {
    summaryText = `The citizen has filed a case under '${category}' for the issue '${subIssueStr}'. Case details provided: ${answersFormatted}.`;
  }

  return res.json({ category, sub_issue: subIssueStr, summary: summaryText, ai_summary: summaryText, disclaimer });
});

// Generate checklist via OpenAI (with mock fallback)
const generateChecklist = catchAsync(async (req, res) => {
  const { category, sub_issue } = req.body;

  if (!category) throw new AppError('Missing required parameter: category', 400);

  const subIssueStr = sub_issue || 'General';

  const openai = getOpenAIClient();
  if (openai) {
    try {
      const userPrompt = `List required documents and evidence items for a ${category} case involving ${subIssueStr} in India. Return a valid JSON object with exactly two arrays: "requiredDocuments" and "evidence".`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_SAFETY_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 400
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const reqDocs = parsed.requiredDocuments || parsed.required_documents || [];
      const evDocs = parsed.evidence || [];

      return res.json({ category, sub_issue: subIssueStr, requiredDocuments: reqDocs, required_documents: reqDocs, evidence: evDocs });
    } catch (error) {
      logger.warn('[OpenAI Fallback] Failed to call OpenAI generateChecklist, using mock data:', { message: error.message });
    }
  }

  // Fallback mock logic
  const data = categoryData[category] || categoryData['Other'];
  return res.json({ category, sub_issue: subIssueStr, requiredDocuments: data.checklist.required, required_documents: data.checklist.required, evidence: data.checklist.evidence });
});

// Generate procedure guide via OpenAI (with mock fallback)
const generateProcedureGuide = catchAsync(async (req, res) => {
  const { category } = req.body;

  if (!category) throw new AppError('Missing required parameter: category', 400);

  const disclaimer = 'Disclaimer: This outline is for general information. It does not constitute binding legal counsel. Please consult an advocate for case-specific representation.';

  const openai = getOpenAIClient();
  if (openai) {
    try {
      const userPrompt = `List the general court procedure steps for a ${category} case in India. Return a valid JSON object with key "procedure" containing an array of step strings. Label it as general guidance.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_SAFETY_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 400
      });

      const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
      const steps = parsed.procedure || parsed.procedure_steps || [];

      return res.json({ category, procedure: steps, procedure_steps: steps, note: disclaimer });
    } catch (error) {
      logger.warn('[OpenAI Fallback] Failed to call OpenAI generateProcedureGuide, using mock data:', { message: error.message });
    }
  }

  // Fallback mock logic
  const data = categoryData[category] || categoryData['Other'];
  return res.json({ category, procedure: data.procedure, procedure_steps: data.procedure, note: disclaimer });
});

export { getQuestionsByCategory, generateSummary, generateChecklist, generateProcedureGuide, categoryData };

export default {
  getQuestionsByCategory,
  generateSummary,
  generateChecklist,
  generateProcedureGuide,
  categoryData
};
