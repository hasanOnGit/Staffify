const AiKnowledgeBase = require("../models/aiKnowledgeBase.model");

const openSourceArticles = [
  {
    docId: "KB-EPF-101",
    title: "Employees' Provident Fund (EPF) Statutory Regulations",
    category: "Labor Law & Statutory",
    tags: ["epf", "pf", "provident fund", "statutory", "pension", "eps", "edli"],
    summary:
      "EPF requires 12% employee and 12% employer contribution on Basic + DA up to the statutory ceiling of ₹15,000/month. Employer share splits into 8.33% EPS (Pension) capped at ₹1,250 and 3.67% EPF, plus 0.5% EDLI insurance.",
    content: `### EPF (Employees' Provident Fund) Regulatory Framework
1. **Applicability**: Mandatory for all commercial establishments employing 20 or more persons.
2. **Statutory Wage Ceiling**: ₹15,000 per month (Basic Pay + Dearness Allowance). Employees earning above ₹15,000 can voluntarily opt for higher contributions with employer concurrence.
3. **Contribution Breakdown**:
   - **Employee Share**: 12% of (Basic + DA) deducted directly from salary.
   - **Employer Share (12%)**:
     - 8.33% diverted to Employees' Pension Scheme (EPS) capped at ₹1,250 per month.
     - 3.67% credited to Employees' Provident Fund (EPF).
     - 0.50% administrative charges.
     - 0.50% Employees' Deposit Linked Insurance (EDLI) capped at ₹75 per month.
4. **Remittance Deadline**: 15th of the subsequent month via EPFO Unified Portal.
5. **Tax Implications**: Employee contributions qualify for 80C deductions; employer contributions up to ₹7.5 lakh across PF/NPS/Superannuation are tax-exempt.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What is the EPF contribution rate?",
      "How is employer PF split into EPS and EPF?",
      "What is the wage ceiling for mandatory EPF?",
      "When is the monthly EPF deposit due date?",
    ],
  },
  {
    docId: "KB-ESI-102",
    title: "Employees' State Insurance (ESIC) Guidelines & Benefits",
    category: "Labor Law & Statutory",
    tags: ["esic", "esi", "state insurance", "medical", "statutory", "health"],
    summary:
      "ESIC applies to establishments with 10+ employees where monthly gross wages are up to ₹21,000 (₹25,000 for persons with disabilities). Employee contributes 0.75% and employer contributes 3.25% of gross wages.",
    content: `### ESIC (Employees' State Insurance) Statutory Norms
1. **Applicability**: Non-seasonal factories and establishments employing 10 or more persons.
2. **Gross Wage Ceiling**: ₹21,000 per month gross pay (₹25,000 for differently-abled employees).
3. **Contribution Rates**:
   - **Employee Contribution**: 0.75% of gross monthly wages.
   - **Employer Contribution**: 3.25% of gross monthly wages.
   - **Total Remittance**: 4.00% of gross wages.
4. **Key Insured Benefits**:
   - **Medical Benefit**: Comprehensive outpatient and inpatient healthcare for employee and family dependents.
   - **Sickness Benefit**: 70% of average daily wage for certified illness up to 91 days in a year.
   - **Maternity Benefit**: 100% of average wage for 26 weeks.
   - **Disability & Dependent Benefit**: Monthly pensions in case of employment injury or occupational hazards.
5. **Due Date**: Monthly payment must be remitted by the 15th of the succeeding month via ESIC portal.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What is the ESIC wage threshold?",
      "What are the employee and employer ESI contribution rates?",
      "What medical benefits does ESIC provide to employees?",
    ],
  },
  {
    docId: "KB-GRAT-103",
    title: "Payment of Gratuity Act, 1972 Rules & Calculation Formula",
    category: "Compensation & Benefits",
    tags: ["gratuity", "severance", "retirement", "separation", "tenure"],
    summary:
      "Gratuity is payable to an employee on separation after rendering continuous service for not less than 5 years. Calculated as (15 * Last Drawn Basic * Tenure in Years) / 26, capped at statutory limit of ₹20,00,000.",
    content: `### Payment of Gratuity Act Guidelines
1. **Eligibility Criteria**:
   - Completion of 5 years of continuous service with the same employer.
   - Exception: 5-year requirement is waived in case of death or permanent disablement of the employee.
2. **Statutory Calculation Formula**:
   - **Gratuity Amount** = \`(15 × Last Drawn Basic Salary & DA × Completed Years of Service) ÷ 26\`
   - 15 represents half a month's wages (15 working days).
   - 26 represents total working days in a month excluding 4 weekly off days.
   - Service of 6 months or more in the final year is rounded up to a full completed year.
3. **Statutory Maximum Ceiling**: Tax-free gratuity is capped at ₹20,00,000 (Twenty Lakhs) under Section 10(10).
4. **Disbursement Timeline**: Must be paid within 30 days from when it becomes payable; simple interest accrues on delays.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "How is gratuity calculated?",
      "What is the minimum tenure to be eligible for gratuity?",
      "What is the maximum tax-free gratuity limit?",
    ],
  },
  {
    docId: "KB-LEAVE-104",
    title: "Sandwich Leave Policy & Leave Management Norms",
    category: "Leave & Attendance Policy",
    tags: ["sandwich", "leave", "weekend", "holiday", "policy", "attendance"],
    summary:
      "The sandwich leave policy stipulates that if an employee takes unapproved or certain leave types on both Friday and Monday (or surrounding a public holiday), intervening non-working weekend days count as part of total leave deducted.",
    content: `### Standard Sandwich Leave Policy Guidelines
1. **Definition & Purpose**:
   - A sandwich leave occurs when an employee takes leave on the working days immediately preceding and succeeding a scheduled weekend or public holiday.
   - Purpose: Encourages systematic advance planning, prevents unannounced multi-day work disruption, and maintains minimum operational team coverage.
2. **How It Works**:
   - **Example**: If an employee takes Leave on Friday and Leave on Monday without prior planned approval:
     - Friday (1 day) + Saturday (1 day) + Sunday (1 day) + Monday (1 day) = **4 days of leave deducted**.
3. **Standard HR Exceptions**:
   - Does not apply if medical certificates are submitted for genuine acute illness.
   - Does not apply to pre-approved Annual Privilege Leaves booked at least 14 days in advance.
   - Casual Leave rules generally exempt sandwiching unless explicitly codified in the employee handbook.
4. **Manager Best Practices**:
   - Ensure leave requests are approved or flagged at least 48 hours prior to long weekend periods.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What is the sandwich leave policy?",
      "Does weekend count as leave if I take Friday and Monday off?",
      "How to avoid sandwich leave deductions?",
    ],
  },
  {
    docId: "KB-PROB-105",
    title: "Probation Period, Evaluation & Confirmation Guidelines",
    category: "General HR Operations",
    tags: ["probation", "confirmation", "performance", "onboarding", "review"],
    summary:
      "Standard probation duration is 3 to 6 months. Employees undergo mid-probation check-ins and a final 360/KPI evaluation before receiving formal written employment confirmation. Notice period during probation is typically 15 to 30 days.",
    content: `### Probationary Employment Guidelines & Best Practices
1. **Standard Duration**: Typically 3 months for junior/mid roles and 6 months for managerial/leadership roles.
2. **Milestone Reviews**:
   - **Day 30**: Orientation & Role Expectation Alignment Check.
   - **Day 60**: Mid-probation progress review with feedback documentation.
   - **Day 90 / 180**: Formal confirmation appraisal by reporting manager and HR.
3. **Outcomes of Probation Review**:
   - **Confirmation**: Issuance of formal Employment Confirmation Letter with eligibility for revised appraisal cycle.
   - **Extension**: Probation can be extended by 1 to 3 months with a written Performance Improvement Plan (PIP) if milestones are partially met.
   - **Separation**: Termination of contract with shorter notice (usually 15 days) if performance is unsatisfactory.
4. **Notice Period Difference**: Shorter notice periods apply during probation compared to confirmed regular employment.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What is the standard probation period?",
      "How is employee probation confirmed?",
      "What happens if probation is extended?",
      "What is the notice period during probation?",
    ],
  },
  {
    docId: "KB-POSH-106",
    title: "POSH Act, 2013 Compliance & ICC Grievance Framework",
    category: "Workplace Governance & POSH",
    tags: ["posh", "harassment", "icc", "compliance", "women", "workplace safety"],
    summary:
      "The POSH Act requires every workplace with 10+ employees to constitute an Internal Complaints Committee (ICC) chaired by a senior female employee. Complaints must be filed within 3 months and inquiries completed within 90 days with strict confidentiality.",
    content: `### POSH (Prevention of Sexual Harassment) Compliance Guide
1. **Mandatory Internal Committee (IC / ICC)**:
   - Mandatory for every establishment with 10 or more employees.
   - **Presiding Officer**: Senior woman employee at the workplace.
   - **Members**: Minimum 2 employee members committed to women's causes or legal knowledge.
   - **External Member**: 1 member from an NGO or legal association familiar with sexual harassment issues.
   - At least 50% of the total committee members must be women.
2. **Filing Timeline**:
   - Complaint must be submitted in writing within 3 months of the incident date (extendable by 3 months with recorded reasons).
3. **Inquiry Procedure**:
   - Conciliation can be offered first at the complainant's request (no monetary settlement).
   - Inquiries must follow principles of natural justice and conclude within 90 days.
   - ICC report must be submitted to employer within 10 days of inquiry completion.
4. **Strict Confidentiality**: Section 16 prohibits publication or disclosure of complainant identity or inquiry contents with statutory financial penalties for breach.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What is POSH compliance?",
      "Who constitutes the Internal Complaints Committee (ICC)?",
      "What is the timeline to complete a POSH inquiry?",
      "How can an employee file a POSH complaint?",
    ],
  },
  {
    docId: "KB-EXIT-107",
    title: "Employee Offboarding, Notice Periods & Full & Final (F&F) Settlement",
    category: "Exit & Separation",
    tags: ["exit", "resignation", "notice period", "settlement", "clearance", "fnf"],
    summary:
      "Employees resign via written portal submission. Standard notice period ranges from 30 to 90 days. Full and Final (F&F) settlement incorporates unpaid wages, accrued leave encashment, bonus, and gratuity within 30 to 45 days after clearance.",
    content: `### Separation & Full and Final (F&F) Settlement Standards
1. **Resignation & Acceptance**:
   - Formal resignation submitted via Staffify Portal or email to reporting manager and HR.
   - Written acknowledgement and acceptance specifying the Last Working Day (LWD).
2. **Notice Period Policy**:
   - Standard 30 days for probationary staff, 60-90 days for confirmed staff.
   - **Notice Buyout**: Allowed only with mutual employer-employee agreement based on business criticality.
3. **Cross-Departmental Clearance Checklist**:
   - **IT & Assets**: Laptop, badge, peripherals, revocation of SSO and cloud credentials.
   - **Finance**: Travel expense settlement, loan/salary advance recovery.
   - **HR**: Exit interview completion, non-disclosure agreement reaffirmation.
4. **F&F Settlement Components**:
   - Pro-rata salary for days worked in the final month.
   - Leave encashment for accrued privilege/earned leaves.
   - Gratuity (if tenure exceeds 5 years).
   - Statutory bonus or variable pay dues.
   - Less: Notice shortfall, tax deductions, or advance loan recoveries.
5. **Timeline**: F&F settlement and Service Certificate must be issued within 30 to 45 days from LWD.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What is the timeline for full and final (F&F) settlement?",
      "What are the components of exit settlement?",
      "What clearances are needed before the last working day?",
      "Can an employee buy out notice period?",
    ],
  },
  {
    docId: "KB-HOURS-108",
    title: "Standard Working Hours, Shift Rosters & Overtime Regulations",
    category: "Labor Law & Statutory",
    tags: ["hours", "overtime", "shift", "roster", "working hours", "night shift"],
    summary:
      "Under the Factories Act and Shops & Establishments Acts, regular working hours are capped at 9 hours per day and 48 hours per week. Work performed beyond standard hours attracts overtime pay at twice the ordinary rate of wages.",
    content: `### Working Hours & Shift Roster Governance
1. **Statutory Limits**:
   - Maximum 9 hours in any day and 48 hours in any week.
   - Mandatory rest interval of at least 30 minutes after continuous 5 hours of work.
   - Spread-over: Total span of work including rest intervals should not exceed 10.5 to 12 hours depending on state rules.
2. **Weekly Off**:
   - Every employee is entitled to at least one full 24-hour continuous rest day per week (typically Sunday).
3. **Overtime Compensation**:
   - Work performed in excess of 9 hours/day or 48 hours/week must be compensated at **double the ordinary hourly wage rate** (\`2 × Ordinary Rate\`).
4. **Night Shift Guidelines**:
   - Shift extending beyond midnight must be followed by a compensatory rest window.
   - Female employees working night shifts require verified safe door-to-door transport, security personnel, and well-lit premises as mandated by state statutory notifications.`,
    applicableRoles: ["Admin", "Manager", "Employee"],
    sampleQuestions: [
      "What are statutory working hours limits?",
      "How is overtime calculated?",
      "What are the regulations for night shifts?",
    ],
  },
];

async function seedOpenSourceKnowledgeBase() {
  try {
    for (const article of openSourceArticles) {
      await AiKnowledgeBase.findOneAndUpdate(
        { docId: article.docId },
        { $set: article },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${openSourceArticles.length} open-source HR knowledge base articles.`);
  } catch (err) {
    console.error("Error seeding knowledge base:", err.message);
  }
}

module.exports = {
  seedOpenSourceKnowledgeBase,
  openSourceArticles,
};
