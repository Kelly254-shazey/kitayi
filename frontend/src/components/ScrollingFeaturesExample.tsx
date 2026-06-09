import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useScrollPosition } from '../hooks/useScrollPosition';
import { Plus } from 'lucide-react';

/**
 * Example Component demonstrating Page Fitting & Dynamic Scrolling Features
 * 
 * This component shows practical examples of:
 * 1. Scroll animations with useScrollAnimation hook
 * 2. Scroll position tracking with useScrollPosition hook
 * 3. Parallax effects
 * 4. Dynamic content based on scroll position
 */
export default function ScrollingFeaturesExample() {
  const { ref: section1Ref, isVisible: isSection1Visible } = useScrollAnimation();
  const { ref: section2Ref } = useScrollAnimation({ threshold: 0.3 });
  const { ref: section3Ref, isVisible: isSection3Visible } = useScrollAnimation();
  const { y, direction } = useScrollPosition();

  return (
    <div className="page-wrapper">
      {/* Hero Section with Parallax */}
      <section
        className="h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center relative overflow-hidden"
        style={{ overflow: 'hidden' }}
      >
        <div
          className="absolute inset-0 parallax-element"
          style={{ transform: `translateY(${y * 0.5}px)` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-cyan-500/5 to-teal-500/10" />
        </div>

        <div className="relative z-10 text-center max-w-2xl px-4">
          <h1 className="text-5xl font-bold mb-6 text-slate-900">
            Page Fitting & Dynamic Scrolling
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Scroll down to see animations in action
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-cta">Get Started</button>
            <button className="btn-brand">Learn More</button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Section 1: Fade In Animation */}
      <section ref={section1Ref} className="py-20 px-4 bg-white">
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${
          isSection1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h2 className="text-4xl font-bold mb-6 text-slate-900">
            Fade In On Scroll
          </h2>
          <p className="text-lg text-slate-600 mb-4">
            This section animates in when it enters the viewport. This is achieved using the
            <code className="bg-slate-100 px-2 py-1 rounded text-blue-600 mx-1">useScrollAnimation</code>
            hook with a threshold of 0.1.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-6 text-white transition-all duration-700 ${
                  isSection1Visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <h3 className="font-bold text-lg mb-2">Feature {i}</h3>
                <p className="text-sm opacity-90">Staggered animation with delays</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Scroll Direction Detection */}
      <section ref={section2Ref} className="py-20 px-4 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">
            Scroll Direction Detection
          </h2>
          <div className="bg-white rounded-lg p-6 border-2 border-blue-500">
            <p className="text-lg mb-4">
              Current scroll position: <span className="font-bold text-blue-600">{Math.round(y)}px</span>
            </p>
            <p className="text-lg mb-4">
              Scroll direction: <span className={`font-bold ${
                direction === 'down' ? 'text-red-600' :
                direction === 'up' ? 'text-green-600' :
                'text-slate-600'
              }`}>{direction.toUpperCase()}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Floating Action Button */}
      <section ref={section3Ref} className="py-20 px-4 bg-white min-h-[50vh]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-slate-900">
            Sticky & Floating Elements
          </h2>
          <p className="text-lg text-slate-600">
            A floating button appears when you scroll past a certain point.
          </p>
        </div>
      </section>

      {/* Floating Action Button */}
      <div className={`fixed bottom-8 right-8 transition-all duration-500 transform ${
        isSection3Visible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}>
        <button className="btn-cta rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
          <Plus className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
