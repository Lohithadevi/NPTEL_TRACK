export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-2">About Campus LinkUp</h1>
      <p className="text-blue-400 text-sm font-medium mb-8">Built for St. Joseph's College of Engineering, Chennai</p>

      <div className="space-y-8 text-slate-400 leading-relaxed">
        <div>
          <h2 className="text-white font-semibold text-lg mb-2">The Problem</h2>
          <p>Students appearing for NPTEL, competitive exams, or college events often travel to distant centers alone. This is unsafe, expensive, and stressful.</p>
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg mb-2">The Solution</h2>
          <p>Campus LinkUp automatically matches students traveling to the same destination within a 60-minute window. Post your trip, find your match, request to join, and chat — all in one place.</p>
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg mb-2">How It Works</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Register with your college email (@stjosephs.ac.in)</li>
            <li>Create a travel post with your destination and time</li>
            <li>Get matched with students on the same route</li>
            <li>Send a "Request to Join" — creator accepts or declines</li>
            <li>Chat privately once accepted</li>
          </ol>
        </div>
        <div className="border border-navy-700 rounded p-6">
          <h2 className="text-white font-semibold mb-1">St. Joseph's College of Engineering</h2>
          <p className="text-sm">Chennai, Tamil Nadu — A premier institution committed to student safety and community.</p>
        </div>
      </div>
    </div>
  );
}
