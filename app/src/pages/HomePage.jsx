import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center font-sans"
      style={{ backgroundImage: "url('/bg2.jpg')" }}
    >
      {/* Overlay for readability */}
      <div className="bg-white/80 min-h-screen backdrop-blur-sm">
        {/* Navbar */}
        <nav className="flex justify-between items-center px-8 py-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 font-serif">
            SlateAi
          </h1>

          <div className="space-x-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Register
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border border-black text-black px-5 py-2 rounded-lg hover:bg-black hover:text-white transition"
            >
              Login
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex flex-col items-center text-center mt-12 px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight font-serif mb-6">
            Bring Ideas to Life with Visual Learning
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl font-light">
            Slateai empowers students and educators with an interactive
            whiteboard experience powered by{" "}
            <span className="font-semibold">our powerful whiteboard</span>.
            Collaborate, explain, sketch, and explore — visually.
          </p>

          <div className="mt-12 flex justify-center">
            <video
              src="/0601.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-[80%] h-auto rounded-xl" // custom width 60%
            />
          </div>
        </main>

        {/* Pricing Section */}
        <section className="mt-24 px-6 pb-20 text-center">
          <h3 className="text-4xl font-bold text-gray-800 mb-10 font-serif">
            Affordable Plans for Everyone
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Basic */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border hover:shadow-2xl transition">
              <h4 className="text-2xl font-bold mb-4">Basic</h4>
              <p className="text-gray-600 mb-6">
                Free forever. Great for individuals.
              </p>
              <p className="text-3xl font-semibold mb-4">$0</p>
              <ul className="text-gray-700 space-y-2 text-left">
                <li>✔ Access to whiteboard</li>
                <li>✔ Unlimited sketches</li>
                <li>✔ Basic tools</li>
              </ul>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border hover:shadow-2xl transition">
              <h4 className="text-2xl font-bold mb-4">Pro</h4>
              <p className="text-gray-600 mb-6">
                Perfect for educators and teams.
              </p>
              <p className="text-3xl font-semibold mb-4">$9.99/mo</p>
              <ul className="space-y-2 text-left">
                <li>✔ All Basic features</li>
                <li>✔ Real-time collaboration</li>
                <li>✔ Export to PDF & PNG</li>
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border hover:shadow-2xl transition">
              <h4 className="text-2xl font-bold mb-4">Premium</h4>
              <p className="text-gray-600 mb-6">
                For institutions and power users.
              </p>
              <p className="text-3xl font-semibold mb-4">$19.99/mo</p>
              <ul className="text-gray-700 space-y-2 text-left">
                <li>✔ All Pro features</li>
                <li>✔ Admin dashboard</li>
                <li>✔ API Access</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
