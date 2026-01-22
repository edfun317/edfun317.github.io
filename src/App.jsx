import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Mail,
  Github,
  Linkedin,
  Sun,
  Clock,
  BookOpen,
  Coffee,
  Briefcase,
  Languages,
  User,
  Database,
  Terminal,
  Cpu,
  Cloud
} from 'lucide-react';

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
    detailed_about: "專注於構建高效且可擴展的後端架構。除了技術之外，我認為程式碼應該是有溫度的，它是解決人類問題的工具。我熱愛攝影，這讓我學會從不同的視角看世界；我也熱愛閱讀，這幫助我在複雜的系統設計中保持思維的清晰與平靜。在開發過程中，我始終追求代碼的優雅與系統的穩健性。",
    tabs: { home: "首頁", about: "關於我", exp: "我的經歷" },
    time_label: "軟體開發累積時間",
    time_units: { y: "年", d: "日", h: "時", m: "分" },
    exp_step: "階段",
    footer_quote: "保持好奇，持續成長",
    since: "計時開始於",
    skill_tree: "技術生態系",
    experiences: [
      { year: "2016 - 2017", title: "軟體開發新鮮人", desc: "開啟了與代碼對話的人生軌跡，初會前後端分離，API開發，程式碼重構。" },
      { year: "2017 - 2023", title: "資深", desc: "專專注於分散式系統的優雅轉型，不僅優化效能，更重視團隊協作的溫度專注於分散式系統的優雅轉型，不僅優化效能，更重視團隊協作的溫度專注於分散式系統的優雅轉型，不僅優化效能，更重視團隊協作的溫度注於分散式系統的優雅轉型，不僅優化效能，更重視團隊協作的溫度。" },
      { year: "2023 - 2024", title: "資深", desc: "專注於分散式系統的優雅轉型，不僅優化效能，更重視團隊協作的溫度。" },
      { year: "2024 - 2025", title: "後端開發工程師", desc: "負責雲端原生應用開發，將複雜的技術規格轉化為直觀的服務流程。" }
    ]
  },
  en: {
    name: "Edward Fan",
    title: "Senior Backend Engineer",
    bio: "在冷冰冰的程式碼中，加入一點點溫暖。",
    bio_en: "Adding a touch of warmth to the realm of cold code.",
    detailed_about: "Hi, I'm Alex. I specialize in building efficient and scalable backend architectures. Beyond technology, I believe code should carry human warmth—it is a tool for solving human problems. I love photography, which teaches me to see the world through different lenses, and reading, which helps me maintain clarity and peace amidst complex system designs.",
    tabs: { home: "Home", about: "About", exp: "Experience" },
    time_label: "Accumulated Dev Time",
    time_units: { y: "Y", d: "D", h: "H", m: "M" },
    exp_step: "Step",
    footer_quote: "Stay Curious & Keep Growing",
    since: "Counting since",
    skill_tree: "Skill Ecosystem",
    experiences: [
      { year: "2024 - Present", title: "Senior Architect", company: "Warmth Tech", desc: "Focusing on elegant transformation of distributed systems, prioritizing both performance and team collaboration." },
      { year: "2021 - 2023", title: "Backend Developer", company: "Creative Lab", desc: "Responsible for cloud-native app development, translating complex technical specs into intuitive service flows." },
      { year: "2018 - 2021", title: "Junior Developer", company: "Starting Point Studio", desc: "Started the journey of conversing with code, building a solid technical foundation in DB design." }
    ]
  },
  skills: [
    { category: "Backend Core", icon: <Terminal size={18} />, tech: ["Golang", "Java", "Python", "gRPC"] },
    { category: "Storage", icon: <Database size={18} />, tech: ["PostgreSQL", "Redis", "Elasticsearch"] },
    { category: "Cloud & Platform", icon: <Cloud size={18} />, tech: ["AWS", "GCP", "Terraform", "Serverless"] },
    { category: "Infrastructure", icon: <Cpu size={18} />, tech: ["Docker", "Kubernetes", "CI/CD"] }
  ]
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

// ==========================================
// 3. 主程式組件
// ==========================================
const App = () => {
  const [lang, setLang] = useState('cn');
  const [activeTab, setActiveTab] = useState('home');
  const [expIndex, setExpIndex] = useState(0);

  const t = PORTFOLIO_CONTENT[lang];
  const experiences = t.experiences;
  const currentExp = experiences[expIndex];

  const toggleLang = () => {
    setLang(prev => prev === 'cn' ? 'en' : 'cn');
    setExpIndex(0);
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
                  onClick={() => setActiveTab(key)}
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
                <p className="text-lg md:text-xl leading-[2] text-[#5d5d5d] first-letter:text-6xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-letter:text-[#3e2723] font-serif">
                  {t.detailed_about}
                </p>
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

          {activeTab === 'exp' && (
            <div className="space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-1000 pt-4">
              <div className="max-w-5xl mx-auto bg-white border border-[#e8e2d9] rounded-[3rem] p-10 md:p-16 shadow-[0_25px_50px_rgba(0,0,0,0.01)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-[#a39382] group-hover:rotate-3 transition-transform duration-1000 select-none">
                  <Briefcase size={220} />
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-16">
                    <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#8b7355] bg-[#faf8f5] px-6 py-2 rounded-full border border-[#e8e2d9]">
                      {t.exp_step} {expIndex + 1} / {experiences.length}
                    </span>
                    <div className="flex gap-4">
                      <button
                        onClick={() => setExpIndex(p => Math.max(0, p - 1))}
                        disabled={expIndex === 0}
                        className="w-12 h-12 rounded-full border border-[#e8e2d9] flex items-center justify-center disabled:opacity-20 hover:bg-[#5d4037] hover:text-white transition-all shadow-sm"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        onClick={() => setExpIndex(p => Math.min(experiences.length - 1, p + 1))}
                        disabled={expIndex === experiences.length - 1}
                        className="w-12 h-12 rounded-full border border-[#e8e2d9] flex items-center justify-center disabled:opacity-20 hover:bg-[#5d4037] hover:text-white transition-all shadow-sm"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-12 gap-8 md:gap-20 items-center min-h-[220px]" key={expIndex}>
                    <div className="md:col-span-5 space-y-3">
                      <div className="text-[11px] font-bold text-[#8b7355] font-sans tracking-[0.2em] uppercase opacity-50">{currentExp.year}</div>
                      <h2 className="text-3xl md:text-5xl font-bold text-[#3e2723] leading-tight mb-2">{currentExp.title}</h2>
                      <p className="text-[#a39382] text-xl font-serif italic"> {currentExp.company}</p>
                    </div>
                    <div className="md:col-span-7">
                      <div className="w-20 h-1 bg-[#e8e2d9] mb-8 rounded-full"></div>
                      <p className="text-lg md:text-xl leading-[1.8] text-[#5d5d5d] font-sans font-light">
                        {currentExp.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col items-center mb-16">
                  <div className="h-px w-28 bg-[#e8e2d9] mb-6"></div>
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.6em] text-[#a39382]">
                    {t.skill_tree}
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative px-4">
                  {PORTFOLIO_CONTENT.skills.map((skill, i) => (
                    <div key={i} className="bg-white border border-[#e8e2d9] p-8 rounded-[2.5rem] shadow-sm hover:translate-y-[-8px] hover:shadow-lg transition-all duration-500 group">
                      <div className="flex flex-col items-center text-center">
                        <div className="p-5 bg-[#faf8f5] rounded-2xl text-[#8b7355] mb-8 group-hover:bg-[#5d4037] group-hover:text-white transition-all duration-500">
                          {React.cloneElement(skill.icon, { size: 28 })}
                        </div>
                        <h4 className="font-bold text-[#3e2723] mb-8 tracking-[0.2em] text-[11px] uppercase border-b border-[#e8e2d9] pb-4 w-full">
                          {skill.category}
                        </h4>
                        <div className="flex flex-wrap justify-center gap-3">
                          {skill.tech.map(techItem => (
                            <span key={techItem} className="px-3 py-1 bg-[#fdfbf7] text-[#8b7355] text-[10px] rounded-full border border-[#e8e2d9] font-medium tracking-widest hover:bg-[#e8e2d9] hover:text-white transition-colors cursor-default">
                              {techItem}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
