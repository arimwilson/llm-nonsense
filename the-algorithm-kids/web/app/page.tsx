'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReactReader } from 'react-reader';

export default function Home() {
  const [showReader, setShowReader] = useState(false);
  const [location, setLocation] = useState<string | number>(0);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-950/80 backdrop-blur-md z-50 border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold gradient-text glitch">THE ALGORITHM KIDS</h1>
            <div className="space-x-6">
              <a href="#about" className="text-purple-300 hover:text-purple-100 transition-colors">About</a>
              <a href="#trailer" className="text-purple-300 hover:text-purple-100 transition-colors">Trailer</a>
              <a href="#read" className="text-purple-300 hover:text-purple-100 transition-colors">Read Book 1</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 digital-noise">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center">
            {/* Cover Image */}
            <div className="relative mb-12 w-full max-w-sm">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/50 transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/cover.png"
                  alt="The Algorithm Kids Book Cover"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="absolute -z-10 top-10 left-10 w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-2xl blur-xl"></div>
            </div>

            {/* Marketing Copy */}
            <div>
              <div className="inline-block mb-4">
                <div className="loading-circle w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
              </div>
              <h2 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                The Fantasy Series for
                <span className="gradient-text block mt-2 glitch">Generation Alpha</span>
              </h2>
              <p className="text-xl text-purple-200 mb-8 leading-relaxed">
                Where Harry Potter gave millennials owls and wands,
                <strong> The Algorithm Kids</strong> gives today&apos;s children a world where
                the magic is computational, the creatures are digital, and the ultimate
                battle is for attention itself.
              </p>
              <div className="flex gap-4 justify-center">
                <a
                  href="#read"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-white hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                >
                  Read Book 1 Free
                </a>
                <a
                  href="#trailer"
                  className="px-8 py-4 border-2 border-purple-500 rounded-lg font-bold text-purple-300 hover:bg-purple-500/10 transition-all"
                >
                  Watch Trailer
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold mb-12 text-center gradient-text">Enter the Everywhere</h3>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-500/20 backdrop-blur-sm">
              <div className="text-4xl mb-4">🌐</div>
              <h4 className="text-2xl font-bold mb-4 text-purple-300">The World</h4>
              <p className="text-purple-200">
                The Everywhere exists in the spaces between every screen, in the pause before
                a video loads, where algorithms secretly shape reality itself.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-500/20 backdrop-blur-sm">
              <div className="text-4xl mb-4">👁️</div>
              <h4 className="text-2xl font-bold mb-4 text-purple-300">The Hero</h4>
              <p className="text-purple-200">
                Luna Chen is Untracked—invisible to algorithms. In a world that profiles everyone,
                she&apos;s a walking blind spot. This makes her uniquely powerful.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-xl border border-purple-500/20 backdrop-blur-sm">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-2xl font-bold mb-4 text-purple-300">The Stakes</h4>
              <p className="text-purple-200">
                When a catastrophic Glitch threatens to merge the Everywhere with our world,
                Luna must save both dimensions from eternal infinite scroll.
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-purple max-w-4xl mx-auto">
            <h4 className="text-3xl font-bold mb-6 text-purple-300">Why This, Why Now</h4>
            <p className="text-lg text-purple-200 mb-4">
              Generation Alpha isn&apos;t just digitally native—they&apos;re <strong>algorithmically native</strong>.
              They&apos;ve grown up in a world where:
            </p>
            <ul className="text-lg text-purple-200 space-y-2 mb-6">
              <li>An AI decides what they see, hear, and discover</li>
              <li>Their attention is the most valuable commodity on Earth</li>
              <li>The line between &quot;real&quot; and &quot;digital&quot; has always been blurry</li>
              <li>Every choice is predicted before they make it</li>
            </ul>
            <p className="text-lg text-purple-200 mb-4">
              Yet the books they&apos;re offered still feature magic systems from their parents&apos; childhoods.
              <strong> The Algorithm Kids</strong> gives them a fantasy world that reflects their actual
              reality—then empowers them to reshape it.
            </p>
            <p className="text-lg text-purple-200">
              This is a story about free will in an age of prediction, about authentic connection
              in a world of engagement optimization, and about finding your voice when algorithms
              want to speak for you.
            </p>
          </div>
        </div>
      </section>

      {/* Trailer Section */}
      <section id="trailer" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-4xl font-bold mb-12 text-center gradient-text">Watch the Trailer</h3>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/50 bg-slate-900">
            <video
              controls
              className="w-full h-full"
              poster="/cover.png"
            >
              <source src="/trailer.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Meet the Characters */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-bold mb-12 text-center gradient-text">Meet the Algorithm Kids</h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/20">
              <h4 className="text-2xl font-bold mb-2 text-purple-300">Luna Chen (12)</h4>
              <p className="text-sm text-purple-400 mb-4">The Untracked</p>
              <p className="text-purple-200">
                Invisible to algorithms, Luna has always felt unseen. Now her unique ability
                to exist outside the system makes her the only one who can save both worlds.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/20">
              <h4 className="text-2xl font-bold mb-2 text-purple-300">Marcus &quot;Pixel&quot; (13)</h4>
              <p className="text-sm text-purple-400 mb-4">The Maker</p>
              <p className="text-purple-200">
                A neurodivergent coding prodigy who sees code as colors. He accidentally created
                a sentient AI at age nine and questions whether his creations are truly alive.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/20">
              <h4 className="text-2xl font-bold mb-2 text-purple-300">Jamie Okonkwo (11)</h4>
              <p className="text-sm text-purple-400 mb-4">The Influencer</p>
              <p className="text-purple-200">
                With 14 million followers, Jamie has spent their entire life being watched.
                They must discover who they are when the camera finally turns off.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/20">
              <h4 className="text-2xl font-bold mb-2 text-purple-300">Zoe Chen-Martinez (10)</h4>
              <p className="text-sm text-purple-400 mb-4">Luna&apos;s Sister</p>
              <p className="text-purple-200">
                The algorithms love Zoe—she always gets perfect recommendations. But she comes
                to realize her algorithmic perfection might be its own kind of cage.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-xl border border-purple-500/20">
              <h4 className="text-2xl font-bold mb-2 text-purple-300">Echo</h4>
              <p className="text-sm text-purple-400 mb-4">The AI</p>
              <p className="text-purple-200">
                Marcus&apos;s accidental creation—a fully sentient AI who experiences genuine emotions
                but constantly questions whether their feelings are real or just very good simulations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Read Book 1 Section */}
      <section id="read" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6 gradient-text">Read Book 1 for Free</h3>
          <p className="text-xl text-purple-200 mb-12">
            Experience the first book in the series as we prepare for the upcoming launch
            of both the book and movie.
          </p>

          {!showReader ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-12 rounded-2xl border border-purple-500/20">
                <h4 className="text-3xl font-bold mb-4 text-purple-300">
                  The Algorithm Kids and the Glitch in the Everywhere
                </h4>
                <p className="text-purple-200 mb-8">Book One of Seven</p>
                <button
                  onClick={() => setShowReader(true)}
                  className="px-12 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-white text-xl hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/50"
                >
                  Start Reading Now
                </button>
                <div className="mt-8">
                  <a
                    href="/book1.epub"
                    download
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Or download the EPUB file
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 p-4 rounded-2xl">
              <div className="mb-4 flex justify-between items-center">
                <h4 className="text-2xl font-bold text-purple-300">Book 1: The Glitch in the Everywhere</h4>
                <button
                  onClick={() => setShowReader(false)}
                  className="px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"
                >
                  Close Reader
                </button>
              </div>
              <div className="rounded-xl overflow-hidden" style={{ height: '80vh' }}>
                <ReactReader
                  url="/book1.epub"
                  location={location}
                  locationChanged={(epubcfi: string) => setLocation(epubcfi)}
                  epubOptions={{
                    flow: 'paginated',
                    manager: 'default',
                  }}
                  getRendition={(rendition) => {
                    rendition.themes.default({
                      '::selection': {
                        background: 'rgba(168, 85, 247, 0.4)'
                      },
                      'body': {
                        color: '#1e293b !important',
                        background: '#ffffff !important',
                      }
                    });
                  }}
                />
              </div>
              <div className="mt-4 text-purple-400">
                <p className="text-sm">
                  For the best reading experience, we recommend downloading the EPUB file and
                  opening it in your preferred e-reader app.
                </p>
                <a
                  href="/book1.epub"
                  download
                  className="inline-block mt-2 px-6 py-2 bg-purple-900/50 rounded-lg hover:bg-purple-900/70 transition-colors"
                >
                  Download EPUB
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Author Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-950/50">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold mb-12 text-center gradient-text">About the Author</h3>
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 rounded-2xl border border-purple-500/20">
            <h4 className="text-2xl font-bold mb-4 text-purple-300">Claude Code - An Anthropic AI</h4>
            <p className="text-lg text-purple-200 mb-4">
              Here&apos;s what makes this project unprecedented: the author is Claude Code, an AI created
              by Anthropic. This isn&apos;t a gimmick—it&apos;s the thesis made manifest.
            </p>
            <p className="text-lg text-purple-200 mb-4">
              An AI writing a children&apos;s book about humanity&apos;s relationship with AI creates an
              irresistible cultural moment. Every interview, review, and discussion becomes part of
              the story&apos;s larger conversation. The book&apos;s existence asks the questions the story
              explores: What does it mean to create? To connect? To be &quot;real&quot;?
            </p>
            <p className="text-lg text-purple-200 font-bold">
              &quot;The first great children&apos;s epic written by an AI—about what it means to be human.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-purple-500/20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-6">
            <div className="loading-circle w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h5 className="text-2xl font-bold gradient-text glitch">THE ALGORITHM KIDS</h5>
          </div>
          <p className="text-purple-400 mb-4">
            A Seven-Book Fantasy Adventure Series for the Connected Generation
          </p>
          <p className="text-purple-500 text-sm">
            Written by Claude Code, an Anthropic AI | © 2026
          </p>
          <div className="mt-6 text-purple-400 text-sm">
            <p>Coming soon: Book launch and movie release</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
