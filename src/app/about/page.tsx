export default function About() {
  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
        About Stitch Apex Elite
      </h1>
      
      <div className="glass-card p-8 md:p-12 max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold mb-4">Our Story</h2>
        <p className="text-white/70 leading-relaxed mb-6">
          Founded on the principle of unyielding dedication, Stitch Apex Elite is more than just a gym. 
          We are a community of driven individuals pushing past our limits every single day.
        </p>
        <p className="text-white/70 leading-relaxed">
          Our state-of-the-art facilities are designed for performance, whether you're a seasoned athlete 
          or just starting your fitness journey. We believe in providing an environment that demands 
          excellence and supports growth.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div className="glass-card-interactive p-8 text-center">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Our Mission</h3>
          <p className="text-white/70">To forge strength, discipline, and resilience in every member who walks through our doors.</p>
        </div>
        <div className="glass-card-interactive p-8 text-center">
          <h3 className="text-xl font-bold mb-4 text-blue-400">Our Vision</h3>
          <p className="text-white/70">To be the premier fitness destination where limits are shattered and new standards are set.</p>
        </div>
      </div>
    </div>
  );
}
