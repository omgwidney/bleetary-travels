import type { Metadata } from "next";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — Bleetary Travels",
  description: "The terms and conditions governing your use of Bleetary Travels.",
};

const EFFECTIVE_DATE = "1 August 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-sm text-gray-400 mb-2">Effective {EFFECTIVE_DATE}</p>
        <h1 className="text-4xl font-black text-gray-900 mb-8">Terms of Service</h1>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">1. Acceptance</h2>
            <p>
              By creating an account or booking a trip through Bleetary Travels, you agree to these
              Terms. If you do not agree, do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">2. Eligibility</h2>
            <p>
              You must be at least 18 years old to create an account or make a booking. By using
              Bleetary, you represent that you meet this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">3. Bookings and payments</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>A booking is confirmed only after the deposit payment has been successfully processed.</li>
              <li>By saving a payment method, you consent to scheduled off-session installment charges in accordance with the payment schedule shown at time of booking.</li>
              <li>Your payment schedule is snapshotted at booking. Changes made by the host after your booking do not affect your obligations.</li>
              <li>All prices are in US dollars (USD).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">4. Cancellation and refunds</h2>
            <p>
              Please review our{" "}
              <a href="/legal/cancellation" className="text-[#13b5b1] underline">
                Cancellation &amp; Refund Policy
              </a>{" "}
              before booking. Cancellation terms vary by departure and are displayed on the trip
              detail page. By completing a booking you accept the stated cancellation terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">5. Host responsibilities</h2>
            <p>
              Hosts are independent community leaders, not Bleetary employees. Bleetary provides
              the platform and logistical support; the host is responsible for the community
              experience, communications with participants, and the accuracy of their trip
              description. Hosts must not misrepresent destinations, inclusions, or capacity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">6. Traveler responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You are responsible for obtaining any required visas, vaccinations, or travel documents.</li>
              <li>Bleetary strongly recommends comprehensive travel insurance covering cancellation, medical, and evacuation.</li>
              <li>You agree to respect fellow travelers and local communities on all Bleetary trips.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, Bleetary Travels is not liable for: (a) acts
              or omissions of hosts or third-party operators; (b) force majeure events including
              natural disasters, pandemics, or government travel restrictions; (c) indirect or
              consequential losses. Our total liability to you in connection with any booking shall
              not exceed the amount you paid for that booking.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">8. Intellectual property</h2>
            <p>
              The Bleetary Travels brand, logo, and platform are our intellectual property. Trip
              content (descriptions, itineraries, photos) belongs to the respective host or
              destination partner. Nothing in these Terms transfers any IP rights to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">9. Governing law</h2>
            <p>
              These Terms are governed by the laws of the jurisdiction in which Bleetary Travels
              is incorporated. Any disputes shall be resolved through binding arbitration unless
              prohibited by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">10. Changes</h2>
            <p>
              We may update these Terms. We will notify you of material changes at least 14 days
              before they take effect. Continued use after that date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">11. Contact</h2>
            <p>
              Legal enquiries:{" "}
              <a href="mailto:legal@bleetarytravels.com" className="text-[#13b5b1] underline">
                legal@bleetarytravels.com
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
