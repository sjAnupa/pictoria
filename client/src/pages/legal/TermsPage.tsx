import { Link } from 'react-router-dom'
import LegalDocumentLayout, { LegalSection } from './LegalDocumentLayout'

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      title="Terms of Service"
      description="Terms that govern your use of the Pictoriya illustrated library website and related services."
      updated="15 November 2026"
    >
      <LegalSection title="Agreement">
        <p>
          By using Pictoriya you agree to these Terms of Service and our{' '}
          <Link to="/privacy" className="font-semibold text-[#8B2635] no-underline hover:underline">
            Privacy Policy
          </Link>
          . If you do not agree, do not use the service.
        </p>
      </LegalSection>

      <LegalSection title="The service">
        <p>
          Pictoriya provides an online catalog of illustrated books, reading tools, and optional account
          features such as progress, likes, saves, and reviews. Features may change as we improve the product.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <ul className="list-disc space-y-1 pl-5">
          <li>You must provide accurate information when registering or signing in with Google.</li>
          <li>You are responsible for activity under your account.</li>
          <li>We may suspend or close accounts that abuse the service or violate these terms.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Attempt to break into, scrape abusively, or overload our systems</li>
          <li>Upload malware or illegal content through admin or other tools</li>
          <li>Misrepresent your identity or impersonate others</li>
          <li>Redistribute book media in ways that violate copyright or our rights</li>
        </ul>
      </LegalSection>

      <LegalSection title="Content and intellectual property">
        <p>
          Books, illustrations, branding, and software on Pictoriya are owned by us or by rights holders who
          license content to us. You may read content through the service for personal, non-commercial use
          unless a specific title states otherwise. You may not copy, redistribute, or commercially exploit
          library media without permission.
        </p>
      </LegalSection>

      <LegalSection title="Reviews and user content">
        <p>
          If you post reviews or similar content, you grant us a non-exclusive license to display that content
          on Pictoriya. Do not post unlawful, harassing, or infringing material. We may hide or remove content
          that violates these terms.
        </p>
      </LegalSection>

      <LegalSection title="Availability">
        <p>
          We aim for reliable uptime but do not guarantee uninterrupted access. Maintenance, hosting issues, or
          third-party outages (including Google sign-in or cloud storage) may temporarily affect the service.
        </p>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          Pictoriya is provided &quot;as is&quot; without warranties of any kind to the fullest extent permitted
          by law. We are not liable for indirect or consequential damages arising from your use of the service.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update these terms. The &quot;Last updated&quot; date will change when we do. Continued use
          after changes means you accept the updated terms.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          For terms or account questions, email{' '}
          <a className="font-semibold text-[#8B2635] no-underline hover:underline" href="mailto:pictoria.library@gmail.com">
            pictoria.library@gmail.com
          </a>
          .
        </p>
      </LegalSection>
    </LegalDocumentLayout>
  )
}
