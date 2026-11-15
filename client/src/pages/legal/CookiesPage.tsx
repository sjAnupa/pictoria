import { Link } from 'react-router-dom'
import LegalDocumentLayout, { LegalSection } from './LegalDocumentLayout'

export default function CookiesPage() {
  return (
    <LegalDocumentLayout
      title="Cookies & local storage"
      description="How Pictoriya uses cookies and browser storage for sign-in and basic analytics."
      updated="15 November 2026"
    >
      <LegalSection title="What we use">
        <p>
          Pictoriya uses essential browser storage (and similar technologies) to run the site. We do not run a
          large advertising cookie network.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Authentication</strong> — a secure token in local storage so you stay signed in.
          </li>
          <li>
            <strong>Preferences / session</strong> — small values needed for UI and account state.
          </li>
          <li>
            <strong>Anonymous reading analytics</strong> — a limited anonymous id may be used to count unique
            book views without requiring an account.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="Managing storage">
        <p>
          You can clear site data in your browser settings or sign out of Pictoriya. Blocking essential storage
          may prevent sign-in or progress sync from working.
        </p>
      </LegalSection>

      <LegalSection title="More detail">
        <p>
          See our{' '}
          <Link to="/privacy" className="font-semibold text-[#8B2635] no-underline hover:underline">
            Privacy Policy
          </Link>{' '}
          for how personal data is handled overall.
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  )
}
