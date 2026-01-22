'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  MessageCircle, 
  Video, 
  Phone, 
  Users, 
  Shield, 
  Zap,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import Badge from '@/components/ui/Badge';
import SectionTitle from '@/components/ui/SectionTitle';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Redirect authenticated users to chat
    if (isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Prevent body scroll when menu is open on mobile
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const features = [
    {
      icon: MessageCircle,
      title: 'Real-Time Messaging',
      description: 'Send and receive messages instantly with real-time delivery and instant notifications.',
    },
    {
      icon: Video,
      title: 'HD Video Calls',
      description: 'High-quality video calls with crystal clear audio and screen sharing capabilities.',
    },
    {
      icon: Phone,
      title: 'Audio Calls',
      description: 'Make voice calls to your contacts anytime, anywhere with low latency.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        id="hero"
        className={`bg-gradient-to-b px-3 sm:px-10 from-blue-50 via-white to-purple-50 pt-6 h-full ${
          isMenuOpen ? 'overflow-hidden' : ''
        }`}
      >
        <header className="flex items-center justify-between px-6 py-3 md:py-4 shadow-sm max-w-5xl rounded-full mx-auto w-full bg-white">
          <Link href="/" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Let'sChat
            </span>
          </Link>
          <nav
            className={`max-md:absolute max-md:top-0 max-md:left-0 max-md:overflow-hidden items-center justify-center max-md:h-full transition-[width] bg-white/50 backdrop-blur flex-col md:flex-row flex gap-8 text-gray-900 text-sm font-normal ${
              isMenuOpen ? 'max-md:w-full' : 'max-md:w-0'
            }`}
          >
            <a
              className="hover:text-blue-600 transition cursor-pointer"
              href="#hero"
              onClick={(e) => handleSmoothScroll(e, 'hero')}
            >
              Home
            </a>
            <a
              className="hover:text-blue-600 transition cursor-pointer"
              href="#features"
              onClick={(e) => handleSmoothScroll(e, 'features')}
            >
              Features
            </a>
            <a
              className="hover:text-blue-600 transition cursor-pointer"
              href="#footer"
              onClick={(e) => handleSmoothScroll(e, 'footer')}
            >
              Contact
            </a>
            {isAuthenticated ? (
              <Link
                href="/chat"
                className="hover:text-blue-600 transition cursor-pointer md:hidden"
                onClick={() => setIsMenuOpen(false)}
              >
                Chat
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-blue-600 transition cursor-pointer md:hidden"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hover:text-blue-600 transition cursor-pointer md:hidden"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <Link
                href="/chat"
                className="hidden md:flex bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
              >
                Chat
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden md:flex border border-blue-600 text-blue-600 px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="hidden md:flex bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition"
                >
                  Sign up
                </Link>
              </>
            )}
            <button
              className="md:hidden text-gray-600"
              onClick={() => setIsMenuOpen(true)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center max-w-7xl mx-auto w-full">
          {isAuthenticated ? (
            <Link
              href="/chat"
              className="mt-16 mb-6 flex items-center space-x-2 border border-blue-600 text-blue-600 text-xs rounded-full px-4 pr-1.5 py-1.5 hover:bg-blue-50 transition"
            >
              <span>Start chatting with your contacts</span>
              <span className="flex items-center justify-center size-6 p-1 rounded-full bg-blue-600">
                <svg
                  width="14"
                  height="11"
                  viewBox="0 0 16 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 6.5h14M9.5 1 15 6.5 9.5 12"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          ) : (
            <Link
              href="/register"
              className="mt-16 mb-6 flex items-center space-x-2 border border-blue-600 text-blue-600 text-xs rounded-full px-4 pr-1.5 py-1.5 hover:bg-blue-50 transition"
            >
              <span>Start chatting with your contacts</span>
              <span className="flex items-center justify-center size-6 p-1 rounded-full bg-blue-600">
                <svg
                  width="14"
                  height="11"
                  viewBox="0 0 16 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 6.5h14M9.5 1 15 6.5 9.5 12"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          )}
          <h1 className="text-center text-gray-900 font-semibold text-3xl sm:text-4xl md:text-5xl max-w-2xl leading-tight">
            Connect with anyone,
            <span className="text-blue-600"> anywhere, anytime</span>
          </h1>
          <p className="mt-4 text-center text-gray-600 max-w-md text-sm sm:text-base leading-relaxed">
            Experience seamless real-time messaging, crystal-clear video calls, and secure communication 
            all in one beautiful platform.
          </p>
          {isAuthenticated ? (
            <Link
              href="/chat"
              className="mt-8 bg-blue-600 text-white px-6 pr-2.5 py-2.5 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-blue-700 transition"
            >
              <span>Go to Chat</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.821 11.999h13.43m0 0-6.714-6.715m6.715 6.715-6.715 6.715"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ) : (
            <Link
              href="/register"
              className="mt-8 bg-blue-600 text-white px-6 pr-2.5 py-2.5 rounded-full text-sm font-medium flex items-center space-x-2 hover:bg-blue-700 transition"
            >
              <span>Start Chatting Now</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.821 11.999h13.43m0 0-6.714-6.715m6.715 6.715-6.715 6.715"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          )}
          <div
            aria-label="Chat features preview"
            className="mt-12 flex max-md:overflow-x-auto gap-6 max-w-4xl w-full pb-6"
          >
            <div className="w-36 h-44 hover:-translate-y-1 transition duration-300 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 flex-shrink-0 flex items-center justify-center shadow-md">
              <MessageCircle className="w-16 h-16 text-blue-600" />
            </div>
            <div className="w-36 h-44 hover:-translate-y-1 transition duration-300 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 flex-shrink-0 flex items-center justify-center shadow-md">
              <Video className="w-16 h-16 text-purple-600" />
            </div>
            <div className="w-36 h-44 hover:-translate-y-1 transition duration-300 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 flex-shrink-0 flex items-center justify-center shadow-md">
              <Phone className="w-16 h-16 text-blue-600" />
            </div>
            <div className="w-36 h-44 hover:-translate-y-1 transition duration-300 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 flex-shrink-0 flex items-center justify-center shadow-md">
              <Users className="w-16 h-16 text-purple-600" />
            </div>
            <div className="w-36 h-44 hover:-translate-y-1 transition duration-300 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 flex-shrink-0 flex items-center justify-center shadow-md">
              <Shield className="w-16 h-16 text-blue-600" />
            </div>
          </div>
        </main>
      </section>

      {/* Features Section */}
      <section id="features" className="px-3 sm:px-10 py-16 bg-white">
        <div className="max-w-7xl mx-auto">
          <Badge text="Features" variant="blue" />
          <SectionTitle
            title="Connect and communicate"
            description="Our streamlined platform helps you stay connected with real-time messaging, video calls, and secure communication features."
          />

          <div className="flex flex-col md:flex-row items-center mt-12">
            <div className="max-w-2xl w-full mb-10 md:mb-0 md:mr-10">
              <div className="space-y-10 px-4 md:px-0">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center justify-center gap-6 max-w-md">
                      <div className="p-6 aspect-square bg-blue-100 rounded-full">
                        <Icon className="w-7 h-7 text-blue-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-base font-semibold text-gray-700">{feature.title}</h3>
                        <p className="text-sm text-gray-600">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Users, title: 'Group Chats', desc: 'Create groups and chat with multiple people' },
                { icon: Shield, title: 'Secure & Private', desc: 'End-to-end encryption for all conversations' },
                { icon: Zap, title: 'Lightning Fast', desc: 'Optimized for speed with instant delivery' },
                { icon: CheckCircle2, title: 'Cross-Platform', desc: 'Works on all devices and platforms' },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="flex flex-col items-center justify-center mx-auto max-md:mx-2 max-md:px-2 max-w-5xl w-full text-center rounded-2xl py-16 bg-slate-100/70 my-16">
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.5 31.5L2 36l4.5-8.5a14 14 0 1 1 8 8z" stroke="#4F39F6" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M14 14h14M14 21h10" stroke="#4F39F6" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <h1 className="text-2xl md:text-3xl font-medium text-slate-900 max-w-2xl mt-5">
          Join thousands of users connecting on Let'sChat.
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mt-2">
          Let'sChat gives you real-time messaging, video calls, and secure communication so you can stay connected with anyone, anywhere, anytime.
        </p>
        <div className="flex gap-2">
          {isAuthenticated ? (
            <Link
              href="/chat"
              className="px-8 py-2.5 mt-4 text-sm bg-indigo-600 hover:scale-105 transition duration-300 text-white rounded-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Go to Chat
            </Link>
          ) : (
            <Link
              href="/register"
              className="px-8 py-2.5 mt-4 text-sm bg-indigo-600 hover:scale-105 transition duration-300 text-white rounded-md flex items-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              Get Started
            </Link>
          )}
          <button className="flex items-center gap-2 px-8 py-2.5 mt-4 text-sm hover:scale-105 transition duration-300 rounded-md text-gray-700 hover:text-gray-900">
            Github
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clipPath="url(#a)">
                <path fillRule="evenodd" clipRule="evenodd" d="M7 0C3.133 0 0 3.133 0 7a7 7 0 0 0 4.786 6.641c.35.062.482-.149.482-.332 0-.166-.01-.718-.01-1.304-1.758.324-2.213-.429-2.353-.823-.079-.2-.42-.822-.717-.988-.246-.132-.596-.455-.01-.464.552-.009.946.508 1.077.717.63 1.06 1.636.762 2.039.578.061-.455.245-.761.446-.936-1.557-.175-3.185-.779-3.185-3.456 0-.762.271-1.392.717-1.882-.07-.175-.314-.892.07-1.855 0 0 .587-.183 1.926.718a6.5 6.5 0 0 1 1.75-.236c.595 0 1.19.078 1.75.236 1.338-.91 1.925-.718 1.925-.718.385.963.14 1.68.07 1.855a2.7 2.7 0 0 1 .717 1.882c0 2.686-1.636 3.28-3.194 3.456.254.218.473.638.473 1.295 0 .936-.009 1.688-.009 1.925 0 .184.131.402.481.332A7.01 7.01 0 0 0 14 7c0-3.867-3.133-7-7-7" fill="#364153"/>
              </g>
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="relative overflow-hidden px-6 md:px-16 lg:px-24 xl:px-32 w-full text-sm text-slate-500 bg-white pt-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Let'sChat
                </span>
              </div>
            </Link>
            <p className="text-sm/7 mt-6">
              Let'sChat is a free and powerful communication platform with real-time messaging,
              video calls, and secure communication to help you stay connected with anyone, anywhere.
            </p>
          </div>
          <div className="flex flex-col lg:items-center lg:justify-center">
            <div className="flex flex-col text-sm space-y-2.5">
              <h2 className="font-semibold mb-5 text-gray-800">Company</h2>
              <a
                className="hover:text-blue-600 transition cursor-pointer"
                href="#hero"
                onClick={(e) => handleSmoothScroll(e, 'hero')}
              >
                About us
              </a>
              <a
                className="hover:text-blue-600 transition cursor-pointer"
                href="#features"
                onClick={(e) => handleSmoothScroll(e, 'features')}
              >
                Features
              </a>
              <a
                className="hover:text-blue-600 transition cursor-pointer"
                href="#footer"
                onClick={(e) => handleSmoothScroll(e, 'footer')}
              >
                Contact
              </a>
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-gray-800 mb-5">
              Subscribe to our newsletter
            </h2>
            <div className="text-sm space-y-6 max-w-sm">
              <p>
                Get updates on new features, tips, and communication strategies sent to
                your inbox weekly.
              </p>
              <div className="flex items-center">
                <input
                  className="rounded-l-md bg-gray-100 outline-none w-full max-w-64 h-11 px-3 focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  type="email"
                  placeholder="Enter your email"
                />
                <button className="bg-gradient-to-b from-blue-600 to-blue-800 cursor-pointer hover:from-blue-700 hover:to-blue-900 transition px-4 h-11 text-white rounded-r-md font-medium">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 border-t mt-6 border-slate-200">
          <p className="text-center flex items-center gap-2">
            Copyright {new Date().getFullYear()} ©{' '}
            <Link href="/" className="inline-flex items-center">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Let'sChat
              </span>
            </Link>{' '}
            All Right Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
