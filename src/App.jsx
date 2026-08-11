import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import {
  Mail,
  Github,
  Linkedin,
  Sun,
  Clock,
  BookOpen,
  Coffee,
  Languages,
  User,
  Terminal,
  Cpu,
  Cloud,
  Tag,
  ArrowLeft
} from 'lucide-react';
import { posts, categories } from './posts.js';

// ==========================================
// 1. 內容資料區 (Content Data)
// 讓你可以在此直接修改文字，不影響設計
// ==========================================
const PORTFOLIO_CONTENT = {
  common: {
    careerStartDate: "2016-06-01T00:00:00",
    // 如果你在本地運行，請將照片放入 public 資料夾，並在此修改路徑
    // 例如：avatarUrl: "./my-photo.jpg",
    avatarUrl: "./myphoto.png",
    socials: [
      { icon: <Github size={18} />, link: "https://github.com/edfun317" },
      { icon: <Linkedin size={18} />, link: "#" },
      { icon: <Mail size={18} />, link: "mailto:your-email@example.com" }
    ]
  },
  cn: {
    name: "Edward Fan",
    title: "Senior Backend Engineer",
    bio: "在冷冰冰的程式碼中，加入一點點溫暖。",
    bio_en: "Adding a touch of warmth to the realm of cold code.",
    detailed_about: [
      "擁有 10 年軟體開發經驗，其中 9 年專注於 Go，亦具備多種程式語言的前後端開發經驗。曾帶領小型技術團隊，負責多個專案的架構設計、技術演進與開發規範建立。",
      "我相信，軟體工程真正的價值不只是完成需求，而是持續打造一套能夠長期演進的系統。因此，我特別重視系統的可靠性、可擴展性與資料正確性，曾導入 Clean Architecture、建立 Coding Standard 與 Code Review 機制，讓團隊在快速迭代的同時仍能維持良好的開發品質。",
      "面對複雜問題時，我習慣從整體架構、資料流、效能瓶頸與隱性依賴關係切入，找出真正影響系統穩定性的根本原因，而不是只修正表面的問題。我享受將複雜系統逐步整理成更簡潔、更容易理解，也更容易維護的樣貌。",
      "工作之外，我喜歡旅行與閱讀。旅行讓我習慣用不同的角度理解世界，也提醒自己每個問題都可能存在不同的解法；閱讀則幫助我持續吸收新的知識與思維，讓自己在快速變化的技術領域中保持學習與成長。"
    ],
    tabs: { home: "首頁", about: "關於我", skills: "技能", articles: "文章" },
    articles_all_tag: "全部",
    article_categories: {
      ai: "AI Agent",
      gcp: "GCP"
    },
    time_label: "軟體開發累積時間",
    time_units: { y: "年", d: "日", h: "時", m: "分" },
    footer_quote: "保持好奇，持續成長",
    since: "計時開始於",
    skill_tree: "技術生態系",
    skills: [
      {
        category: "核心技能",
        icon: <Terminal size={18} />,
        items: ["Go (8年+), Gin, Echo, FastHTTP", "RESTful API, WebSocket", "微服務架構"]
      },
      {
        category: "架構設計",
        icon: <Cpu size={18} />,
        items: [
          "系統架構設計與技術決策：評估技術方案並主導系統設計取捨",
          "高併發／高可用系統設計",
          "第三方系統整合設計（含支付系統）",
          "Clean Architecture"
        ]
      },
      {
        category: "研發技術",
        icon: <Cloud size={18} />,
        items: [
          "其他開發語言：PHP, React, Vue, Lua, Python",
          "資料庫：MySQL, PostgreSQL, MongoDB, Redis",
          "訊息驅動架構：RabbitMQ, Redis Pub/Sub, GCP Pub/Sub",
          "雲平台：GCP, AWS",
          "測試：Unit Testing, K6, PProf",
          "其他：gRPC/ProtoBuf, ELK/EFK stack, Jaeger"
        ]
      },
      {
        category: "軟實力",
        icon: <User size={18} />,
        items: [
          "擅長化繁為簡，將商業需求轉化為可落地的技術方案",
          "自主推進與遠端協作：少監督下能獨立解決問題、持續交付",
          "具備跨國/遠端團隊協作經驗"
        ]
      }
    ]
  },
  en: {
    name: "Edward Fan",
    title: "Senior Backend Engineer",
    bio: "在冷冰冰的程式碼中，加入一點點溫暖。",
    bio_en: "Adding a touch of warmth to the realm of cold code.",
    detailed_about: [
      "I have 10 years of software development experience, 9 of which have been focused on Go, along with full-stack experience across multiple programming languages. I have led small engineering teams, responsible for architecture design, technical evolution, and establishing development standards across several projects.",
      "I believe the true value of software engineering isn't just fulfilling requirements, but continuously building a system that can evolve over the long term. That's why I place strong emphasis on reliability, scalability, and data correctness — introducing Clean Architecture, establishing coding standards, and setting up code review practices that let teams iterate quickly without sacrificing quality.",
      "When facing complex problems, I tend to start from the overall architecture, data flow, performance bottlenecks, and hidden dependencies to uncover the root causes affecting system stability, rather than just patching surface-level symptoms. I enjoy the process of gradually refactoring complex systems into something simpler, clearer, and easier to maintain.",
      "Outside of work, I enjoy traveling and reading. Traveling has taught me to see the world from different perspectives and reminds me that every problem may have more than one solution. Reading helps me continuously absorb new knowledge and ways of thinking, keeping me learning and growing in a fast-changing technical field."
    ],
    tabs: { home: "Home", about: "About", skills: "Skills", articles: "Articles" },
    articles_all_tag: "All",
    article_categories: {
      ai: "AI Agent",
      gcp: "GCP"
    },
    time_label: "Accumulated Dev Time",
    time_units: { y: "Y", d: "D", h: "H", m: "M" },
    footer_quote: "Stay Curious & Keep Growing",
    since: "Counting since",
    skill_tree: "Skill Ecosystem",
    skills: [
      {
        category: "Core Skills",
        icon: <Terminal size={18} />,
        items: ["Go (8+ yrs), Gin, Echo, FastHTTP", "RESTful API, WebSocket", "Microservices Architecture"]
      },
      {
        category: "Architecture",
        icon: <Cpu size={18} />,
        items: [
          "System architecture design & technical decision-making: evaluating tradeoffs and leading design direction",
          "High-concurrency / high-availability system design",
          "Third-party system integration design (incl. payment systems)",
          "Clean Architecture"
        ]
      },
      {
        category: "R&D",
        icon: <Cloud size={18} />,
        items: [
          "Other languages: PHP, React, Vue, Lua, Python",
          "Databases: MySQL, PostgreSQL, MongoDB, Redis",
          "Message-driven architecture: RabbitMQ, Redis Pub/Sub, GCP Pub/Sub",
          "Cloud platforms: GCP, AWS",
          "Testing: Unit Testing, K6, PProf",
          "Others: gRPC/ProtoBuf, ELK/EFK stack, Jaeger"
        ]
      },
      {
        category: "Soft Skills",
        icon: <User size={18} />,
        items: [
          "Skilled at simplifying complexity — translating business needs into actionable technical solutions",
          "Self-driven & remote collaboration: solves problems independently and delivers consistently with minimal oversight",
          "Experience collaborating with cross-border / remote teams"
        ]
      }
    ]
  }
};

// ==========================================
// 2. 子組件
// ==========================================

const JumpRopeAnimation = () => {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame(f => (f + 1) % 2), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full flex justify-center py-6">
      <svg width="220" height="110" viewBox="0 0 300 150" fill="none">
        <line x1="20" y1="130" x2="280" y2="130" stroke="#dcd3c7" strokeWidth="1" strokeDasharray="4 4" />
        <g transform="translate(40, 80)">
          <circle cx="10" cy="10" r="8" stroke="#8b7355" strokeWidth="1.5" />
          <line x1="10" y1="18" x2="10" y2="40" stroke="#8b7355" strokeWidth="1.5" />
          <line x1="10" y1="25" x2={frame === 0 ? "25" : "20"} y2={frame === 0 ? "15" : "30"} stroke="#8b7355" strokeWidth="1.5" />
        </g>
        <g transform="translate(240, 80)">
          <circle cx="10" cy="10" r="8" stroke="#8b7355" strokeWidth="1.5" />
          <line x1="10" y1="18" x2="10" y2="40" stroke="#8b7355" strokeWidth="1.5" />
          <line x1="10" y1="25" x2={frame === 0 ? "-5" : "0"} y2={frame === 0 ? "15" : "30"} stroke="#8b7355" strokeWidth="1.5" />
        </g>
        <path d={frame === 0 ? "M 65 95 Q 150 20 235 95" : "M 65 105 Q 150 145 235 105"} stroke="#bcaaa4" strokeWidth="1.5" fill="none" className="transition-all duration-700" />
        <g transform={`translate(110, ${frame === 0 ? 95 : 75})`}><circle cx="5" cy="5" r="5" stroke="#a39382" strokeWidth="1" /><line x1="5" y1="10" x2="5" y2="22" stroke="#a39382" strokeWidth="1" /></g>
        <g transform={`translate(160, ${frame === 0 ? 75 : 95})`}><circle cx="5" cy="5" r="5" stroke="#a39382" strokeWidth="1" /><line x1="5" y1="10" x2="5" y2="22" stroke="#a39382" strokeWidth="1" /></g>
      </svg>
    </div>
  );
};

const DevTimeCard = ({ startDate, langData }) => {
  const [time, setTime] = useState({ years: 0, days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date() - new Date(startDate);
      setTime({
        years: Math.floor(diff / 31536000000),
        days: Math.floor((diff / 86400000) % 365),
        hours: Math.floor((diff / 3600000) % 24),
        mins: Math.floor((diff / 60000) % 60)
      });
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [startDate]);

  return (
    <div className="relative rotate-1 hover:rotate-0 transition-transform duration-500 max-w-xs mx-auto md:mx-0">
      <div className="absolute inset-0 bg-[#e8e2d9] rounded-lg translate-x-1.5 translate-y-1.5 -z-10 opacity-30"></div>
      <div className="bg-white border border-[#e8e2d9] p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div className="w-8 h-1 bg-[#8b7355]/20 rounded-full"></div>
          <Clock size={16} className="text-[#8b7355] opacity-40" />
        </div>
        <div className="text-center space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#a39382]">{langData.time_label}</h4>
          <div className="grid grid-cols-4 gap-1">
            <div><div className="text-2xl font-serif italic text-[#5d4037]">{time.years}</div><div className="text-[9px] text-[#bcaaa4] uppercase">{langData.time_units.y}</div></div>
            <div><div className="text-2xl font-serif italic text-[#5d4037]">{time.days}</div><div className="text-[9px] text-[#bcaaa4] uppercase">{langData.time_units.d}</div></div>
            <div><div className="text-2xl font-serif italic text-[#5d4037]">{time.hours}</div><div className="text-[9px] text-[#bcaaa4] uppercase">{langData.time_units.h}</div></div>
            <div><div className="text-2xl font-serif italic text-[#5d4037]">{time.mins}</div><div className="text-[9px] text-[#bcaaa4] uppercase">{langData.time_units.m}</div></div>
          </div>
          <div className="pt-3 border-t border-dashed border-[#e8e2d9] text-[9px] italic text-[#bcaaa4]">
            {langData.since} {new Date(startDate).getFullYear()}
          </div>
        </div>
      </div>
    </div>
  );
};

const ArticleDetail = ({ post, categoryLabel, onBack }) => (
  <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#a39382] hover:text-[#5d4037] transition-colors mb-10"
    >
      <ArrowLeft size={16} /> Back
    </button>
    <span className="inline-block px-3 py-1 bg-[#faf8f5] text-[#8b7355] text-[10px] rounded-full border border-[#e8e2d9] font-medium tracking-widest mb-5">
      {categoryLabel}
    </span>
    <h2 className="text-3xl md:text-4xl font-bold text-[#3e2723] leading-tight mb-3">{post.title}</h2>
    <p className="text-[11px] text-[#bcaaa4] uppercase tracking-[0.2em] mb-10">{post.date}</p>
    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }} />
  </div>
);

// ==========================================
// 3. 主程式組件
// ==========================================
const App = () => {
  const [lang, setLang] = useState('cn');
  const [activeTab, setActiveTab] = useState('home');
  const [activeTag, setActiveTag] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const t = PORTFOLIO_CONTENT[lang];
  const filteredPosts = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts;

  const toggleLang = () => {
    setLang(prev => prev === 'cn' ? 'en' : 'cn');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#4a4a4a] font-serif selection:bg-[#e8e2d9] p-4 md:p-10 lg:px-20 lg:py-12 transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header Section */}
        <header className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
          <div className="relative">
            <div className="w-28 h-36 bg-[#eee8e1] rounded-xl overflow-hidden shadow-sm border-2 border-white rotate-[-2deg] transition-transform hover:rotate-0 duration-500">
              <img src={PORTFOLIO_CONTENT.common.avatarUrl} alt="Avatar" className="w-full h-full object-cover sepia-[10%]" />
            </div>
            <div className="absolute -top-3 -right-3 bg-white p-2 rounded-full shadow-md text-orange-400 animate-pulse">
              <Sun size={18} fill="currentColor" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end">
              <div>
                <h1 className="text-4xl font-bold text-[#3e2723] mb-1">{t.name}</h1>
                <p className="text-[#8b7355] text-sm italic mb-4 tracking-wide">{t.title}</p>
              </div>
              <button
                onClick={toggleLang}
                className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#a39382] hover:text-[#5d4037] border border-[#e8e2d9] px-5 py-2 rounded-full transition-all hover:bg-white"
              >
                <Languages size={14} /> {lang === 'cn' ? 'English' : '正體中文'}
              </button>
            </div>

            <nav className="flex justify-center md:justify-start gap-10 border-b border-[#e8e2d9]">
              {Object.keys(t.tabs).map((key) => (
                <button
                  key={key}
                  onClick={() => { setActiveTab(key); setSelectedPost(null); }}
                  className={`pb-4 text-[12px] font-bold uppercase tracking-[0.25em] transition-all relative ${activeTab === key ? 'text-[#5d4037]' : 'text-[#bcaaa4] hover:text-[#8b7355]'}`}
                >
                  {t.tabs[key]}
                  {activeTab === key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5d4037] animate-in slide-in-from-left duration-300"></div>}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Tab Content */}
        <main className="min-h-[500px]">
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="md:col-span-7 space-y-12">
                <div className="space-y-6 pt-4 text-center md:text-left">
                  <div className="relative">
                    <div className="absolute -left-8 -top-6 text-8xl text-[#e8e2d9] font-serif opacity-30 select-none">"</div>
                    <p className="text-3xl md:text-4xl leading-tight text-[#3e2723] font-serif tracking-tight" style={{ fontFamily: 'Georgia, "Noto Serif TC", serif' }}>
                      {t.bio}
                    </p>
                    <p className="text-xl italic text-[#8b7355] font-serif leading-relaxed mt-6 border-l-2 border-[#e8e2d9] pl-6 tracking-widest opacity-70" style={{ fontFamily: 'Georgia, serif' }}>
                      {t.bio_en}
                    </p>
                  </div>
                </div>
                <div>
                  <JumpRopeAnimation />
                  <p className="text-center text-[10px] uppercase tracking-[0.4em] text-[#bcaaa4] mt-2">Harmonious Rhythm</p>
                </div>
              </div>
              <div className="md:col-span-5 pt-8">
                <DevTimeCard startDate={PORTFOLIO_CONTENT.common.careerStartDate} langData={t} />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="space-y-8 bg-white/30 p-10 md:p-14 rounded-[3rem] border border-[#e8e2d9]/50 shadow-sm backdrop-blur-sm">
                <div className="flex items-center gap-4 text-[#8b7355]">
                  <div className="p-3 bg-white rounded-xl shadow-xs"><User size={26} /></div>
                  <h2 className="text-xl font-bold uppercase tracking-[0.25em]">Personal Narrative</h2>
                </div>
                <div className="space-y-6">
                  {t.detailed_about.map((para, i) => (
                    <p
                      key={i}
                      className={`text-lg md:text-xl leading-[2] text-[#5d5d5d] font-serif ${i === 0 ? 'first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-[#3e2723]' : ''}`}
                    >
                      {para}
                    </p>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10">
                  <div className="bg-white/80 border border-[#e8e2d9] p-7 rounded-[2rem] flex items-center gap-5 hover:shadow-md transition-all group">
                    <div className="bg-[#faf8f5] p-3 rounded-xl group-hover:bg-[#8b7355] group-hover:text-white transition-colors"><Coffee size={24} /></div>
                    <span className="text-base font-medium tracking-wide">Brewing Code & Coffee</span>
                  </div>
                  <div className="bg-white/80 border border-[#e8e2d9] p-7 rounded-[2rem] flex items-center gap-5 hover:shadow-md transition-all group">
                    <div className="bg-[#faf8f5] p-3 rounded-xl group-hover:bg-[#8b7355] group-hover:text-white transition-colors"><BookOpen size={24} /></div>
                    <span className="text-base font-medium tracking-wide">Philosophy in Logic</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pt-4">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                  <div className="h-px w-28 bg-[#e8e2d9] mb-6"></div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.6em] text-[#a39382]">
                    {t.skill_tree}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative px-4">
                  {t.skills.map((skill, i) => (
                    <div key={i} className="bg-white border border-[#e8e2d9] p-8 rounded-[2.5rem] shadow-sm hover:translate-y-[-8px] hover:shadow-lg transition-all duration-500 group">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-5 bg-[#faf8f5] rounded-2xl text-[#8b7355] mb-8 group-hover:bg-[#5d4037] group-hover:text-white transition-all duration-500">
                          {React.cloneElement(skill.icon, { size: 28 })}
                        </div>
                        <h4 className="font-bold text-[#3e2723] mb-8 tracking-[0.2em] text-[11px] uppercase border-b border-[#e8e2d9] pb-4 w-full">
                          {skill.category}
                        </h4>
                        <ul className="space-y-2.5 text-left w-full">
                          {skill.items.map((item, j) => (
                            <li key={j} className="text-[12px] text-[#5d5d5d] font-sans leading-relaxed flex gap-2">
                              <span className="text-[#bcaaa4] shrink-0">–</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'articles' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {selectedPost ? (
                <ArticleDetail post={selectedPost} categoryLabel={t.article_categories[selectedPost.category]} onBack={() => setSelectedPost(null)} />
              ) : (
                <div className="max-w-5xl mx-auto">
                  <div className="flex flex-wrap justify-center gap-3 mb-14">
                    <button
                      onClick={() => setActiveTag(null)}
                      className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all ${!activeTag ? 'bg-[#5d4037] text-white border-[#5d4037]' : 'border-[#e8e2d9] text-[#a39382] hover:text-[#5d4037] hover:bg-white'}`}
                    >
                      <Tag size={12} /> {t.articles_all_tag}
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveTag(cat)}
                        className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border transition-all ${activeTag === cat ? 'bg-[#5d4037] text-white border-[#5d4037]' : 'border-[#e8e2d9] text-[#a39382] hover:text-[#5d4037] hover:bg-white'}`}
                      >
                        {t.article_categories[cat]}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredPosts.map((post) => (
                      <button
                        key={post.slug}
                        onClick={() => setSelectedPost(post)}
                        className="text-left bg-white border border-[#e8e2d9] rounded-[2rem] p-8 shadow-sm hover:shadow-lg hover:translate-y-[-4px] transition-all duration-500"
                      >
                        <span className="inline-block px-2.5 py-0.5 bg-[#faf8f5] text-[#8b7355] text-[9px] rounded-full border border-[#e8e2d9] font-medium tracking-widest mb-4">
                          {t.article_categories[post.category]}
                        </span>
                        <h3 className="text-xl font-bold text-[#3e2723] leading-snug mb-2">{post.title}</h3>
                        <p className="text-sm text-[#5d5d5d] leading-relaxed line-clamp-3">{post.description}</p>
                        <div className="text-[10px] text-[#bcaaa4] mt-5 uppercase tracking-widest">{post.date}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="mt-28 py-12 border-t border-[#e8e2d9] flex flex-col md:flex-row justify-between items-center gap-8 text-[#bcaaa4] text-[10px] uppercase tracking-[0.4em]">
          <div className="flex items-center gap-3">
            <Coffee size={16} className="animate-bounce" />
            <span>{t.footer_quote}</span>
          </div>
          <div className="flex items-center gap-10">
            {PORTFOLIO_CONTENT.common.socials.map((s, i) => (
              <a key={i} href={s.link} className="hover:text-[#5d4037] hover:scale-150 transition-all duration-300">{s.icon}</a>
            ))}
          </div>
          <div className="font-sans font-medium tracking-[0.1em]">© {new Date().getFullYear()} {t.name} • Crafted with Heart</div>
        </footer>
      </div>

      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#efebe9] rounded-full blur-[140px] opacity-20 -z-20 animate-pulse pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#f5f5f5] rounded-full blur-[140px] opacity-20 -z-20 pointer-events-none"></div>
    </div>
  );
};

export default App;
