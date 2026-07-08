"use client";

import { LegalDoc, type LegalSection } from "@/components/marketing/LegalDoc";

const SECTIONS: LegalSection[] = [
  {
    heading: "Who we are",
    blocks: [
      {
        type: "p",
        text: "Aptiverse is a South African learning and wellbeing platform for students, families, and tutors. In this policy, Aptiverse, we, us, and our refer to the operator of the Aptiverse service. We are the responsible party for your personal information under the Protection of Personal Information Act, 2013 (POPIA).",
      },
    ],
  },
  {
    heading: "Information we collect",
    blocks: [
      { type: "p", text: "We collect only what we need to run the service well:" },
      {
        type: "ul",
        items: [
          "Account details you give us, such as your name, email address, role, and password.",
          "Learning activity, such as subjects or modules, practice attempts, goals, and marks you enter or generate.",
          "Wellbeing check-ins, such as the mood ratings you choose to log.",
          "Usage and device data, such as pages visited and general device type, used to keep the service reliable and secure.",
          "Payment information, handled by our South African payment provider. We do not store your full card number.",
        ],
      },
    ],
  },
  {
    heading: "How we use your information",
    blocks: [
      { type: "p", text: "We use your information to:" },
      {
        type: "ul",
        items: [
          "Provide and personalise your learning and wellbeing experience.",
          "Generate predictions, practice, and study plans.",
          "Keep your account secure and prevent abuse.",
          "Communicate with you about your account and important changes.",
          "Improve the service, using aggregated and de-identified data where possible.",
        ],
      },
      {
        type: "p",
        text: "We do not sell your personal information, and we do not use the content of your work to train models for anyone else.",
      },
    ],
  },
  {
    heading: "Your private diary",
    blocks: [
      {
        type: "p",
        text: "Your diary is end-to-end encrypted on your own device. The encryption key never leaves your device, which means we cannot read your diary entries, and neither can a parent or anyone else. This is by design and cannot be switched off by an administrator.",
      },
    ],
  },
  {
    heading: "When we share information",
    blocks: [
      { type: "p", text: "We share personal information only in limited cases:" },
      {
        type: "ul",
        items: [
          "With a parent or guardian on a Family plan, who can see summaries such as trends, streaks, and readiness, but never the private diary.",
          "With service providers who help us operate, such as hosting and payments, under strict confidentiality and only as needed.",
          "Where the law requires it, or to protect someone's safety.",
        ],
      },
    ],
  },
  {
    heading: "Your rights under POPIA",
    blocks: [
      { type: "p", text: "You have the right to:" },
      {
        type: "ul",
        items: [
          "Ask what personal information we hold about you and request a copy.",
          "Ask us to correct or delete information that is wrong or no longer needed.",
          "Object to certain processing, and withdraw consent where processing is based on consent.",
          "Lodge a complaint with the Information Regulator of South Africa.",
        ],
      },
      { type: "p", text: "To exercise any of these rights, email support@aptiverse.co.za." },
    ],
  },
  {
    heading: "Keeping your information secure",
    blocks: [
      {
        type: "p",
        text: "We host data in South Africa and protect it with encryption in transit and at rest, access controls, and regular review. No system is perfectly secure, but we take reasonable steps to keep your information safe and to notify you if something goes wrong.",
      },
    ],
  },
  {
    heading: "How long we keep it",
    blocks: [
      {
        type: "p",
        text: "We keep your information for as long as your account is active and for a reasonable period afterwards to meet legal and operational needs. When it is no longer needed, we delete or de-identify it.",
      },
    ],
  },
  {
    heading: "Younger users",
    blocks: [
      {
        type: "p",
        text: "Aptiverse is used by learners of many ages. Where a user is a minor, we expect a parent or guardian to provide consent and to manage the account through a Family plan. If you believe a child has given us information without appropriate consent, contact us and we will address it.",
      },
    ],
  },
  {
    heading: "Changes to this policy",
    blocks: [
      {
        type: "p",
        text: "We may update this policy as the service evolves. If we make a material change, we will let you know through the service or by email. The date at the top shows when it was last updated.",
      },
    ],
  },
  {
    heading: "Contact us",
    blocks: [
      {
        type: "p",
        text: "For any privacy question or request, email support@aptiverse.co.za and we will respond within a reasonable time.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      intro="This policy explains what information Aptiverse collects, how we use it, and the choices you have. We follow the Protection of Personal Information Act (POPIA) and keep your data in South Africa."
      sections={SECTIONS}
    />
  );
}
