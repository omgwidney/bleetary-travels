import type { Metadata } from "next";
import Link from "next/link";
import { Globe, Heart, Shield, Users } from "lucide-react";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About — Bleetary Travels",
  description:
    "Bleetary Travels connects community builders with their audiences through meaningful group travel. Learn how we started and why we exist.",
};

const values = [
  {
    icon: Users,
    title: "Community first",
    body: "Every Bleetary trip starts with an existing community — a fitness crew, a fandom, a friend group, a newsletter. Travel is better when you go with your people.",
  },
  {
    icon: Heart,
    title: "Hosts you trust",
    body: "Our hosts are vetted creators and community leaders who know their audience. They design the vibe; we handle the logistics so they can focus on the experience.",
  },
  {
    icon: Globe,
    title: "Destinations that matter",
    body: "From Bali's rice terraces to Zimbabwe's cloud forests, we curate destinations that go beyond the tourist trail — immersive, authentic, and full of life.",
  },
  {
    icon: Shield,
    title: "Transparent and fair",
    body: "Fixed, all-in pricing. Installment payment plans. Clear cancellation terms. No surprise fees. We believe trust is the foundation of any great trip.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav activeHref="/about" />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-24 px-4 sm:px-6 text-center text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Ccircle cx='30' cy='30' r='2' fill='%23ffffff'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative z-10 max-w-3xl mx-auto">
            <p className="text-[#13b5b1] font-bold text-sm uppercase tracking-widest mb-4">
              Our story
            </p>
            <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
              Travel is better{" "}
              <span className="text-[#f05c40]">with your people</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Bleetary Travels was built to answer a simple question: what if
              every community builder could take their audience on an adventure?
              Not packaged tours. Not random strangers. Real group travel with
              people who already share your interests.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h2 className="text-3xl font-black text-gray-900 mb-6">
            Why we exist
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Millions of creators, educators, coaches, and community leaders have
            built deeply engaged audiences — and those communities want to do
            things together. Until now, turning that desire into an actual trip
            meant negotiating with DMCs, managing spreadsheets, chasing
            payments, and doing everything twice.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Bleetary handles the complexity — destination sourcing, itineraries,
            payment collection, installment plans, participant management — so
            hosts can focus on what they do best: bringing people together.
          </p>
        </section>

        {/* Values */}
        <section className="bg-[#f4f5f7] py-20 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">
              What we believe
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#13b5b1]/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#13b5b1]" />
                  </div>
                  <h3 className="font-black text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 sm:px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              Ready to build your adventure?
            </h2>
            <p className="text-gray-500 text-lg mb-8">
              Whether you want to travel with a community or host one, Bleetary
              makes it possible.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/trips"
                id="about-browse-trips-cta"
                className="inline-flex bg-[#13b5b1] hover:bg-[#0d9b97] text-white font-bold px-7 py-3.5 rounded-full transition-colors shadow-[0_4px_16px_rgba(19,181,177,0.35)]"
              >
                Browse Trips
              </Link>
              <Link
                href="/become-a-host"
                id="about-become-host-cta"
                className="inline-flex bg-[#f05c40] hover:bg-[#d94e34] text-white font-bold px-7 py-3.5 rounded-full transition-colors shadow-[0_4px_16px_rgba(240,92,64,0.35)]"
              >
                Become a Host
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
