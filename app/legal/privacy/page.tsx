import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Bleetary Travels",
  description: "How Bleetary Travels collects, uses, and protects your personal information.",
};

const EFFECTIVE_DATE = "1 August 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-sm text-gray-400 mb-2">Effective {EFFECTIVE_DATE}</p>
        <h1 className="text-4xl font-black text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">1. Who we are</h2>
            <p>
              Bleetary Travels (&ldquo;Bleetary&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates the
              website at <strong>bleetarytravels.com</strong> and related services. We connect community
              hosts with travelers for group travel experiences.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">2. Information we collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Account data:</strong> name, email address, and password (hashed) when you register.</li>
              <li><strong>Profile data:</strong> profile photo, social handles, and bio if you create a host profile.</li>
              <li><strong>Booking data:</strong> trip selection, travel dates, participant count, and payment information (processed by Stripe — we never store raw card numbers).</li>
              <li><strong>Communications:</strong> messages you send to us, support requests, and survey responses.</li>
              <li><strong>Usage data:</strong> pages visited, clicks, device type, and IP address collected automatically.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">3. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To create and manage your account.</li>
              <li>To process bookings and payments.</li>
              <li>To send transactional emails (booking confirmations, payment reminders, trip updates).</li>
              <li>To respond to your support requests.</li>
              <li>To improve our services through aggregated analytics.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">4. Sharing your information</h2>
            <p>We do not sell your personal data. We share it only with:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Trip hosts:</strong> who receive the participant list for their departure (name, email, and booking status only).</li>
              <li><strong>Stripe:</strong> our payment processor. See <a href="https://stripe.com/privacy" className="text-[#13b5b1] underline">stripe.com/privacy</a>.</li>
              <li><strong>Firebase (Google):</strong> our authentication, database, and storage provider.</li>
              <li><strong>Law enforcement:</strong> when required by applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">5. Your rights</h2>
            <p>
              Depending on your jurisdiction, you may have the right to access, correct, delete, or
              export your personal data. To exercise these rights, email us at{" "}
              <a href="mailto:privacy@bleetarytravels.com" className="text-[#13b5b1] underline">
                privacy@bleetarytravels.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">6. Cookies</h2>
            <p>
              We use session cookies to keep you logged in. We use analytics cookies (with your consent
              where required) to understand how you use our site. You can disable cookies in your browser
              settings, but some features may not work correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">7. Data retention</h2>
            <p>
              We retain your account data for as long as your account is active. Booking records are
              retained for 7 years for tax and legal compliance. You may request account deletion at
              any time; payment records required by law will be retained for the statutory period.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of material changes
              by email or by a notice on our website at least 14 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">9. Contact</h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a href="mailto:privacy@bleetarytravels.com" className="text-[#13b5b1] underline">
                privacy@bleetarytravels.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
