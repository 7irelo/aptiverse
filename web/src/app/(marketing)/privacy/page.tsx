"use client";

import { LegalDoc, type LegalSection } from "@/components/marketing/LegalDoc";
import { openConsentPreferences } from "@/lib/analytics/consent";

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
          "If, and only if, you agree to it: which advert or link brought you to us, and which of a short list of steps you completed afterwards. Section 3 sets out exactly what this is and how to turn it off.",
          "Payment information, handled by our South African payment provider. We do not store your full card number.",
        ],
      },
    ],
  },
  {
    // Rewritten when advertising measurement was added, off a runtime audit of
    // what the site actually loads rather than off a template.
    //
    // The previous version of this section said there was no analytics tag and
    // no ad pixel anywhere, and that was true when it was written. It is not
    // true any more, and the honest move is to say exactly what changed and
    // what the person's choice now controls, in the same plain register.
    //
    // The three categories described here map one-to-one onto the code:
    //   - NextAuth session / CSRF / callback-url cookies: strictly necessary,
    //     no consent gate, disclosure only.
    //   - Vercel Web Analytics: cookieless, writes nothing to the device, so
    //     ePrivacy Article 5(3) is not engaged. Runs unless the person rejects
    //     or their browser sends Global Privacy Control.
    //   - Meta pixel and our own campaign record: prior opt-in only. The tag
    //     is not in the page until Accept is pressed.
    heading: "Cookies and what we store in your browser",
    blocks: [
      {
        type: "p",
        text: "Browsing our public pages sets no cookies at all until you choose to allow it. Once you start signing in, three cookies are set, and none of them are optional because without them the service cannot work:",
      },
      {
        type: "ul",
        items: [
          "A session cookie that keeps you signed in. It is created when you log in and cleared when you log out.",
          "A security token that stops another website submitting forms or requests as you.",
          "A short-lived cookie that remembers which page to return you to after sign-in.",
        ],
      },
      {
        type: "p",
        text: "We count page views with Vercel Web Analytics. It is cookieless: it writes nothing to your browser, gives you no identifier, and cannot follow you to another website. It tells us how many people read a page, which page they came from, and roughly where in the world they are. If you reject the banner, or your browser sends a Global Privacy Control signal, we switch it off as well even though it stores nothing.",
      },
      {
        type: "p",
        text: "We advertise to students, and we would like to know which adverts actually help someone find us. If you accept, we load Meta's advertising tag. It sets two cookies in your browser, _fbp and _fbc, which identify your browser to Meta and can be used to recognise you on other websites that also carry it. We use it to count six things and nothing else: arriving from an advert, starting a sign-up, finishing a sign-up, finishing the setup questions, submitting your first practice test, and starting or completing a subscription payment. We also keep a small record of the campaign tags in the link you arrived on, so a sign-up can be matched to the advert that caused it. That record is kept for 30 days and only exists if you accepted.",
      },
      {
        type: "p",
        text: "If you do not accept, none of that happens. The advertising tag is never added to the page, so it cannot set a cookie or send anything, and the campaign record is never written to your device. There is no wall: refusing costs you nothing and every part of Aptiverse works the same.",
      },
      {
        type: "p",
        text: "When a subscription payment is confirmed, our own server reports that one purchase to Meta, again only if you accepted. We do this from the server because a browser on a slow connection often never gets to report it. We send a scrambled, one-way version of your email address rather than the address itself, along with the advertising identifiers already in your browser and the amount paid. We never send your name, your marks, your practice results, your goals or anything from your diary, to Meta or to anyone else.",
      },
      {
        type: "p",
        text: "You can change your mind whenever you like. The choice is stored with the date you made it, so we can show you what you picked and honour it on later visits.",
      },
      { type: "action", label: "Change your privacy choices", onClick: openConsentPreferences },
      {
        type: "p",
        text: "While you are signed in, we also keep a few small settings in your browser's local storage so the app behaves the way you left it: the role whose dashboard you are viewing, whether the sidebar is collapsed, which workspace tab was open, the state of the study timer for each assessment, and your recent tutor chat so a refresh does not lose the conversation. That data stays on your device.",
      },
      {
        type: "p",
        text: "You can clear all of it at any time through your browser's site data settings. Doing so signs you out and resets those preferences, and nothing else is affected.",
      },
      {
        type: "p",
        text: "Two outside parties are involved in normal use, whatever you choose. Our page fonts are served from a content delivery network, which sees your IP address in order to send the font file and sets no cookies. Payments happen on our payment provider's own checkout pages, which set their own cookies there under their policy, not ours.",
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
      // This claimed the diary was end-to-end encrypted with a key that never
      // leaves the student's device, and that we therefore cannot read it. None
      // of that exists. DiaryEntry.Content is stored as plain text, and the same
      // row holds SentimentAnalysis and SentimentScore, which the server writes
      // by reading the entry. A privacy policy is the one document that has to be
      // literally true, and describing encryption that was never built is a
      // material misstatement, not loose copy. What is actually true is still
      // worth saying plainly: nobody else on the platform can read it.
      {
        type: "p",
        text: "Your diary is private from other people. No parent, teacher, tutor or other student can read your entries, on any plan, and that is not something an administrator can switch on.",
      },
      {
        type: "p",
        // Corrected. This previously said "our AI reads each one to work out
        // the mood trend shown on your wellbeing page", which was wrong twice
        // over and had been flagged three separate times.
        //
        // Nothing reads a diary entry. The event that would carry one to an
        // analyser, diary.entry.created, is never published: it appears in the
        // codebase only as an example in a comment and in a consumer that
        // therefore never receives anything. And the mood trend is not built
        // from diary text at all. GetMoodTrendAsync reads the mood check-in
        // scores and averages them per day; it never touches an entry.
        //
        // The error ran in the direction of claiming MORE processing than
        // happens, so readers were consenting to something we do not do. That
        // is still an openness defect under POPIA, and in a document whose only
        // job is to be literally true it is the kind of sentence that costs
        // trust precisely when someone is checking whether to trust you.
        text: "It is not end-to-end encrypted, and we will not tell you otherwise: entries are stored on our servers in a form our systems could read. What we do not do is read them. Nothing analyses your diary, and the mood graph on your wellbeing page is built from the check-ins you tap, not from anything you write. Staff access is restricted to the people who keep the service running, and we do not use diary content to train models.",
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
