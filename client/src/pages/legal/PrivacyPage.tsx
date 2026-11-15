import LegalDocumentLayout, { LegalSection } from './LegalDocumentLayout'

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      description="How Pictoriya collects, uses, and protects your information when you browse, sign in, and read illustrated books."
      updated="15 November 2026"
    >
      <LegalSection title="Who we are">
        <p>
          Pictoriya (&quot;we&quot;, &quot;us&quot;) is an illustrated online library. This policy explains what
          personal data we process when you use our website and related API services.
        </p>
      </LegalSection>

      <LegalSection title="Information we collect">
        <p>Depending on how you use Pictoriya, we may process:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Account details</strong> — name, email address, profile picture, and sign-in provider
            (for example Google), when you create or use an account.
          </li>
          <li>
            <strong>Reading activity</strong> — books you open, chapter/page progress, likes, saves, reviews,
            and view counts needed to run the library experience.
          </li>
          <li>
            <strong>Technical data</strong> — IP address, browser type, device information, and basic server
            logs used for security, rate limiting, and reliability.
          </li>
          <li>
            <strong>Cookies / local storage</strong> — session tokens and preferences stored in your browser
            so you stay signed in and we can keep anonymous reading analytics limited and useful.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="How we use your information">
        <ul className="list-disc space-y-1 pl-5">
          <li>Provide sign-in, your library, progress, likes, saves, and reviews</li>
          <li>Operate, secure, and improve the website and API</li>
          <li>Prevent abuse (including rate limits and account security checks)</li>
          <li>Communicate about your account or service changes when needed</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </LegalSection>

      <LegalSection title="Google sign-in">
        <p>
          If you choose &quot;Continue with Google&quot;, Google shares a verified email, name, and (if
          available) profile photo with us after you consent. We use that only to create or sign in to your
          Pictoriya account. Google&apos;s own practices are described in the{' '}
          <a
            className="font-semibold text-[#8B2635] no-underline hover:underline"
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Google Privacy Policy
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Where data is stored">
        <p>
          Account and library data are stored in our database (currently MongoDB Atlas). Book media may be
          stored on our application servers and/or Cloudflare R2. Hosting providers process data on our
          behalf under their own terms.
        </p>
      </LegalSection>

      <LegalSection title="Retention">
        <p>
          We keep account and reading data while your account is active. You may request deletion of your
          account by contacting us. Backups and security logs may be retained for a limited period.
        </p>
      </LegalSection>

      <LegalSection title="Your choices">
        <ul className="list-disc space-y-1 pl-5">
          <li>Browse many public pages without an account</li>
          <li>Sign out at any time from your account menu</li>
          <li>Request access, correction, or deletion of your account data by email</li>
        </ul>
      </LegalSection>

      <LegalSection title="Children">
        <p>
          Pictoriya is a general illustrated library. If you believe a child has provided personal data
          without appropriate consent, contact us and we will take reasonable steps to remove it.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy as the product evolves. The &quot;Last updated&quot; date at the top
          will change when we do. Continued use after updates means you accept the revised policy.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  )
}
