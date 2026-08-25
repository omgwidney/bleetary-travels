import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — Bleetary Travels",
  description:
    "Bleetary Travels cancellation and refund policy for travelers and hosts.",
};

const EFFECTIVE_DATE = "1 August 2026";

const travelerTiers = [
  { timing: "More than 90 days before departure", refund: "Full deposit refunded" },
  { timing: "61–90 days before departure", refund: "50% of total trip cost refunded" },
  { timing: "31–60 days before departure", refund: "25% of total trip cost refunded" },
  { timing: "30 days or fewer before departure", refund: "No refund" },
];

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <p className="text-sm text-gray-400 mb-2">Effective {EFFECTIVE_DATE}</p>
        <h1 className="text-4xl font-black text-gray-900 mb-8">
          Cancellation &amp; Refund Policy
        </h1>

        <div className="space-y-10 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              Traveler cancellations
            </h2>
            <p className="mb-4">
              All cancellation requests must be submitted in writing through your booking
              page or by emailing{" "}
              <a href="mailto:support@bleetarytravels.com" className="text-[#13b5b1] underline">
                support@bleetarytravels.com
              </a>
              . The date your written cancellation is received determines which tier applies.
            </p>

            <div className="rounded-2xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold text-gray-900">
                      Cancellation timing
                    </th>
                    <th className="text-left px-4 py-3 font-bold text-gray-900">
                      Refund
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {travelerTiers.map((tier, i) => (
                    <tr
                      key={tier.timing}
                      className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-gray-700">{tier.timing}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {tier.refund}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Refunds are processed to your original payment method within 10 business days.
              Stripe processing fees (typically 2.9% + $0.30) are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              Trip cancellation by Bleetary or host
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Departure cancelled (minimum numbers not met):</strong> Full refund of all
                amounts paid. We will notify you at least 60 days before departure where possible.
              </li>
              <li>
                <strong>Departure cancelled due to force majeure</strong> (natural disaster,
                government travel ban, pandemic): Travel credits valid for 24 months will be
                issued. Cash refunds will be evaluated on a case-by-case basis.
              </li>
              <li>
                <strong>Host removes a departure:</strong> Full refund of all amounts paid, plus
                a $50 inconvenience credit applied to a future Bleetary booking.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              Installment payments and failed charges
            </h2>
            <p>
              If a scheduled installment payment fails, we will retry on days 3 and 7. If payment
              is still unsuccessful after 7 days, your booking may be cancelled with the refund
              policy above applied to amounts already paid. You will receive email notifications
              at each stage and may update your payment method through your booking page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">
              Travel insurance
            </h2>
            <p>
              We strongly recommend purchasing comprehensive travel insurance that covers
              cancellation, medical expenses, evacuation, and missed departures. Bleetary is not
              responsible for costs arising from cancellation due to personal circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-gray-900 mb-3">Questions</h2>
            <p>
              Contact us at{" "}
              <a href="mailto:support@bleetarytravels.com" className="text-[#13b5b1] underline">
                support@bleetarytravels.com
              </a>
              {" "}or visit our{" "}
              <Link href="/help" className="text-[#13b5b1] underline">
                Help Center
              </Link>
              .
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
