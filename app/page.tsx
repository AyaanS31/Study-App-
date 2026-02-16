import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "StudentSuccess | Study Smarter. Achieve More.",
  description:
    "An all-in-one academic platform for high school students to study smarter, track progress, plan college, and find scholarships.",
};

export default function Home() {
  return (
    <main className="bg-white text-gray-800">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-600">StudentSuccess</h1>
        <div className="space-x-6 hidden md:block">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
          <a href="/login" className="hover:text-blue-600 transition">Login</a>
          <a
            href="/signup"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-24 px-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          All Your Academic Success <br />
          <span className="text-blue-600">In One Place</span>
        </h2>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-600">
          Study smarter, track your goals, plan college, and discover
          scholarships — everything built for high school students.
        </p>

        <div className="space-x-4">
          <a
            href="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-xl text-lg hover:bg-blue-700 transition"
          >
            Start Free
          </a>
          <a
            href="#features"
            className="border border-gray-300 px-8 py-3 rounded-xl text-lg hover:bg-gray-100 transition"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-12">
          Powerful Tools for Students
        </h3>

        <div className="grid md:grid-cols-3 gap-10">
          <FeatureCard
            title="Flashcard Converter"
            description="Turn your notes into smart flashcards instantly using AI-powered tools."
          />
          <FeatureCard
            title="Time Management"
            description="Pomodoro timers, to-do lists, and smart scheduling to stay organized."
          />
          <FeatureCard
            title="College Planner"
            description="Track GPA, extracurriculars, and see what you need for your dream schools."
          />
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="bg-gray-50 py-20 px-6">
        <h3 className="text-3xl font-bold text-center mb-12">
          Simple Pricing
        </h3>

        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          
          {/* FREE */}
          <div className="bg-white p-10 rounded-2xl shadow-md border">
            <h4 className="text-xl font-semibold mb-4">Free</h4>
            <p className="text-4xl font-bold mb-6">$0</p>
            <ul className="space-y-3 text-gray-600 mb-8">
              <li>✔ Basic Study Tools</li>
              <li>✔ GPA Tracking</li>
              <li>✔ Limited College Planner</li>
            </ul>
            <a
              href="/signup"
              className="block text-center bg-gray-200 py-3 rounded-lg hover:bg-gray-300 transition"
            >
              Get Started
            </a>
          </div>

          {/* PREMIUM */}
          <div className="bg-blue-600 text-white p-10 rounded-2xl shadow-xl">
            <h4 className="text-xl font-semibold mb-4">Premium</h4>
            <p className="text-4xl font-bold mb-6">$9/mo</p>
            <ul className="space-y-3 mb-8">
              <li>✔ Daily Internship Opportunities</li>
              <li>✔ Advanced College Insights</li>
              <li>✔ Scholarship Database</li>
              <li>✔ Mentor Guidance Resources</li>
            </ul>
            <a
              href="/signup"
              className="block text-center bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Upgrade Now
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-20 px-6">
        <h3 className="text-3xl font-bold mb-6">
          Ready to Take Control of Your Future?
        </h3>
        <a
          href="/signup"
          className="bg-blue-600 text-white px-10 py-4 rounded-xl text-lg hover:bg-blue-700 transition"
        >
          Create Your Free Account
        </a>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center">
        <p>© {new Date().getFullYear()} StudentSuccess. All rights reserved.</p>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl border hover:shadow-lg transition">
      <h4 className="text-xl font-semibold mb-4">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
