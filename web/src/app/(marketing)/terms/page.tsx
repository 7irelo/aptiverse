"use client";

import { LegalDoc, type LegalSection } from "@/components/marketing/LegalDoc";

const SECTIONS: LegalSection[] = [
  {
    heading: "Agreement to these terms",
    blocks: [
      {
        type: "p",
        text: "These terms govern your use of Aptiverse. By creating an account or using the service, you agree to them. If you do not agree, please do not use Aptiverse.",
      },
    ],
  },
  {
    heading: "Who can use Aptiverse",
    blocks: [
      {
        type: "p",
        text: "You may use Aptiverse if you can form a binding agreement with us, or if a parent or guardian agrees to these terms on your behalf and manages your account. You are responsible for making sure your use complies with any rules that apply to you.",
      },
    ],
  },
  {
    heading: "Your account",
    blocks: [
      {
        type: "p",
        text: "Keep your login details private and accurate. You are responsible for activity on your account. Tell us promptly if you think someone else has accessed it.",
      },
    ],
  },
  {
    heading: "Subscriptions, billing, and cancellation",
    blocks: [
      {
        type: "ul",
        items: [
          "Free plans remain free. Paid plans are billed monthly or annually in South African Rand, including VAT, through our payment provider.",
          "Paid plans renew automatically until you cancel. You can cancel any time from your settings and keep access until the end of the period you paid for.",
          "Prices may change. We will give you clear notice before a change affects you.",
        ],
      },
    ],
  },
  {
    heading: "Tutors and profiles",
    blocks: [
      {
        type: "p",
        text: "Aptiverse is not a marketplace and does not process payments between tutors and students. Tutors pay a subscription to list a profile and use the tools. Any tutoring arrangement, and any payment for it, is made directly between the tutor and the student, off Aptiverse. We take no commission and are not a party to that arrangement.",
      },
      {
        type: "p",
        text: "Tutors are responsible for the accuracy of their profile, their qualifications, and their conduct. We may remove a profile that breaks these terms.",
      },
    ],
  },
  {
    heading: "Acceptable use",
    blocks: [
      { type: "p", text: "When using Aptiverse, you agree not to:" },
      {
        type: "ul",
        items: [
          "Break the law or infringe anyone's rights.",
          "Misrepresent who you are, or impersonate someone else.",
          "Attempt to disrupt, reverse engineer, or gain unauthorised access to the service.",
          "Upload harmful, abusive, or unlawful content.",
        ],
      },
    ],
  },
  {
    heading: "Your content and ours",
    blocks: [
      {
        type: "p",
        text: "You keep ownership of the content you create. You give us the permission we need to host and show it back to you so the service can work. The Aptiverse name, software, and design belong to us, and you may not copy or reuse them without permission.",
      },
    ],
  },
  {
    heading: "AI-generated help",
    blocks: [
      {
        type: "p",
        text: "Some features use AI to explain concepts, generate practice, and make predictions. AI can be wrong. Treat it as a study aid, check important answers, and do not rely on it as a sole source of truth.",
      },
    ],
  },
  {
    heading: "Wellbeing is not a medical service",
    blocks: [
      {
        type: "p",
        text: "Aptiverse offers wellbeing tools and can connect you to registered counsellors, but it is not a medical or emergency service and does not provide diagnosis or treatment. If you are in crisis or someone is in danger, contact your local emergency services or a crisis line immediately.",
      },
    ],
  },
  {
    heading: "Disclaimers and liability",
    blocks: [
      {
        type: "p",
        text: "We work hard to keep Aptiverse reliable, but we provide it as is and cannot promise it will always be available or error free. To the extent the law allows, we are not liable for indirect or consequential loss. Nothing in these terms limits rights you have under South African consumer protection law that cannot be limited.",
      },
    ],
  },
  {
    heading: "Suspension and termination",
    blocks: [
      {
        type: "p",
        text: "You can close your account at any time. We may suspend or close an account that breaks these terms or puts the service or others at risk. Where fair to do so, we will give notice first.",
      },
    ],
  },
  {
    heading: "Governing law",
    blocks: [
      {
        type: "p",
        text: "These terms are governed by the laws of the Republic of South Africa, and the South African courts have jurisdiction over any dispute.",
      },
    ],
  },
  {
    heading: "Changes to these terms",
    blocks: [
      {
        type: "p",
        text: "We may update these terms as the service changes. If a change is material, we will let you know through the service or by email. Continuing to use Aptiverse after a change means you accept the updated terms.",
      },
    ],
  },
  {
    heading: "Contact us",
    blocks: [
      { type: "p", text: "Questions about these terms? Email support@aptiverse.co.za." },
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      intro="These terms set out the rules for using Aptiverse. We have tried to keep them clear and fair. Please read them, and reach out if anything is unclear."
      sections={SECTIONS}
    />
  );
}
