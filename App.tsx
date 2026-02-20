
import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  BarChart3, 
  BookOpen, 
  Users, 
  ChevronRight, 
  Heart,
  TrendingUp,
  Award,
  Calendar,
  Flame,
  Check,
  Star,
  Zap,
  PlayCircle,
  ExternalLink,
  UserCircle2,
  Edit2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { BIBLE_BOOKS, TOTAL_CHAPTERS, CHRONOLOGICAL_PLAN } from './constants';
import { ReadingProgress, UserProgress, DailyEncouragement, BibleBook, PlanDay } from './types';
import { fetchDailyEncouragement } from './geminiService';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'bible' | 'plan90' | 'stats' | 'community'>('plan90');
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('bible_user_name') || '';
  });
  const [nameInput, setNameInput] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  
  const [myProgress, setMyProgress] = useState<ReadingProgress>(() => {
    const saved = localStorage.getItem('bible_reading_progress');
    return saved ? JSON.parse(saved) : {};
  });
  const [encouragement, setEncouragement] = useState<DailyEncouragement | null>(null);
  
  const communityUsers: UserProgress[] = [
    { id: '1', name: '김성도', avatar: 'https://picsum.photos/seed/user1/100', progress: { gen: Array.from({length: 50}, (_, i) => i + 1), exo: [1,2,3,4,5], psa: [1,2,3] } },
    { id: '2', name: '이권사', avatar: 'https://picsum.photos/seed/user2/100', progress: { mat: Array.from({length: 28}, (_, i) => i + 1), rom: [1,2,3,4,5,6,7,8] } },
    { id: '3', name: '박집사', avatar: 'https://picsum.photos/seed/user3/100', progress: { psa: Array.from({length: 150}, (_, i) => i + 1), pro: [1,2,3,4,5,6,7,8,9,10] } },
    { id: '4', name: '정청년', avatar: 'https://picsum.photos/seed/user4/100', progress: { gen: Array.from({length: 20}, (_, i) => i + 1) } },
  ];

  useEffect(() => {
    localStorage.setItem('bible_reading_progress', JSON.stringify(myProgress));
  }, [myProgress]);

  useEffect(() => {
    localStorage.setItem('bible_user_name', userName);
  }, [userName]);

  useEffect(() => {
    const loadEncouragement = async () => {
      const data = await fetchDailyEncouragement();
      setEncouragement(data);
    };
    loadEncouragement();
  }, []);

  const handleJoin = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const toggleChapter = (bookId: string, chapter: number) => {
    setMyProgress(prev => {
      const chapters = prev[bookId] || [];
      const newChapters = chapters.includes(chapter)
        ? chapters.filter(c => c !== chapter)
        : [...chapters, chapter].sort((a, b) => a - b);
      return { ...prev, [bookId]: newChapters };
    });
  };

  const markDayAsRead = (dayPlan: PlanDay) => {
    setMyProgress(prev => {
      const newProgress = { ...prev };
      dayPlan.readings.forEach(reading => {
        const existing = newProgress[reading.bookId] || [];
        const merged = Array.from(new Set([...existing, ...reading.chapters])).sort((a, b) => a - b);
        newProgress[reading.bookId] = merged;
      });
      return newProgress;
    });
  };

  const isDayComplete = (dayPlan: PlanDay) => {
    return dayPlan.readings.every(reading => {
      const readChapters = myProgress[reading.bookId] || [];
      return reading.chapters.every(ch => readChapters.includes(ch));
    });
  };

  const calculateTotalRead = (progress: ReadingProgress) => {
    return Object.values(progress).reduce((acc, chapters) => acc + chapters.length, 0);
  };

  const myTotalRead = useMemo(() => calculateTotalRead(myProgress), [myProgress]);
  const myPercent = ((myTotalRead / TOTAL_CHAPTERS) * 100).toFixed(1);

  const completedDaysCount = useMemo(() => {
    return CHRONOLOGICAL_PLAN.filter(day => isDayComplete(day)).length;
  }, [myProgress]);

  const statsData = useMemo(() => {
    const data = [
      { name: userName || '나', count: myTotalRead, color: '#4f46e5' },
      ...communityUsers.map((u, i) => ({ 
        name: u.name, 
        count: calculateTotalRead(u.progress),
        color: COLORS[i % COLORS.length]
      }))
    ];
    return data.sort((a, b) => b.count - a.count);
  }, [myTotalRead, userName]);

  const pieData = [
    { name: '읽은 장수', value: myTotalRead },
    { name: '남은 장수', value: TOTAL_CHAPTERS - myTotalRead },
  ];

  const formatReading = (chapters: number[]) => {
    if (chapters.length === 0) return '';
    const sorted = [...chapters].sort((a, b) => a - b);
    const isSequential = sorted.every((val, i) => i === 0 || val === sorted[i - 1] + 1);
    if (isSequential && sorted.length > 1) {
      return `${sorted[0]}~${sorted[sorted.length - 1]}장`;
    }
    return sorted.join(', ') + '장';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 text-slate-900">
      <header className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <div className="max-w-4xl mx-auto flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border border-indigo-500/20">Chronological Plan</span>
            </div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter">
              <Flame className="w-10 h-10 text-orange-400 drop-shadow-lg" />
              90일 통독 메이트
            </h1>
            <p className="text-indigo-200 text-sm mt-2 font-medium opacity-90">연대기 성경 통독으로 완성하는 믿음의 90일</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-xl">
              <div className="text-4xl font-black text-white">{completedDaysCount}<span className="text-xl opacity-40 font-bold">/90</span></div>
              <div className="text-[10px] uppercase tracking-widest opacity-60 font-black mt-1">완료 일수</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto w-full p-6 flex-grow">
        {/* User Profile & Progress Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/60 border border-white mb-8 group">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 w-full">
              {!userName || isEditingName ? (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">이름을 입력하여 그룹에 참여하세요</label>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="성함을 입력해주세요"
                      className="flex-grow bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
                    />
                    <button 
                      onClick={handleJoin}
                      className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                    >
                      참여하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                      <UserCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{userName} <span className="text-slate-400 font-bold text-lg">성도님</span></h2>
                        <button onClick={() => { setNameInput(userName); setIsEditingName(true); }} className="text-slate-300 hover:text-indigo-500 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">Faithful Reading Mate</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-500 fill-current" />
                    <h3 className="text-slate-800 font-black text-lg">나의 완독 페이스</h3>
                  </div>
                  <span className="text-indigo-600 font-black text-3xl tracking-tighter">{myPercent}<span className="text-sm opacity-50">%</span></span>
                </div>
                <div className="w-full bg-slate-100 h-6 rounded-full overflow-hidden border-4 border-slate-50 relative">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-indigo-700 h-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-200 relative z-10" 
                    style={{ width: `${myPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-6 md:border-l border-slate-100 md:pl-8 items-center h-full min-w-[200px] justify-center md:justify-end">
              <div className="text-center">
                <span className="block text-3xl font-black text-slate-800 tracking-tighter">{myTotalRead}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Read</span>
              </div>
              <div className="w-px h-10 bg-slate-100"></div>
              <div className="text-center">
                <span className="block text-3xl font-black text-slate-300 tracking-tighter">{TOTAL_CHAPTERS - myTotalRead}</span>
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Left</span>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'plan90' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                <Calendar className="w-8 h-8 text-indigo-500" />
                90일 연대기 스케줄
              </h2>
              <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full uppercase tracking-widest">Day 1 - 90</span>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              {CHRONOLOGICAL_PLAN.map((plan) => {
                const completed = isDayComplete(plan);
                return (
                  <div 
                    key={plan.day}
                    className={`bg-white p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden ${
                      completed 
                        ? 'border-indigo-100 bg-indigo-50/10 shadow-none grayscale-[0.3]' 
                        : 'border-slate-100 hover:border-indigo-300 shadow-xl shadow-slate-200/50 hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex gap-6 items-center">
                        <div className={`w-16 h-16 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 shadow-inner transition-all transform ${
                          completed ? 'bg-indigo-600 text-white scale-95' : 'bg-slate-50 text-slate-400 group-hover:bg-white'
                        }`}>
                          <span className="text-[10px] font-black uppercase leading-none opacity-80 mb-1">Day</span>
                          <span className="text-2xl font-black leading-none">{plan.day}</span>
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className={`font-black text-xl leading-tight mb-2 ${completed ? 'text-indigo-900 line-through opacity-50' : 'text-slate-800'}`}>
                            {plan.title}
                          </h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            {plan.readings.map((r, i) => (
                              <span key={i} className="text-[11px] font-black bg-slate-100/50 px-3 py-1.5 rounded-xl border border-slate-100 text-slate-500 uppercase tracking-tighter max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                {r.bookName} {formatReading(r.chapters)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {plan.videoUrl && (
                          <a
                            href={plan.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-5 py-4 rounded-2xl font-black text-sm transition-all bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg shadow-red-100 active:scale-95"
                            title="분당우리교회 쉬운통큰통독 영상 보기"
                          >
                            <PlayCircle className="w-5 h-5" />
                            <span className="hidden sm:inline">오늘의 영상</span>
                          </a>
                        )}
                        <button
                          onClick={() => markDayAsRead(plan)}
                          disabled={completed}
                          className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                            completed 
                              ? 'bg-indigo-600 text-white shadow-indigo-100 cursor-default ring-4 ring-indigo-50' 
                              : 'bg-white border-2 border-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-indigo-200'
                          }`}
                        >
                          {completed ? (
                            <><Check className="w-5 h-5 stroke-[4]" /> 완료</>
                          ) : (
                            <><CheckCircle2 className="w-5 h-5" /> 체크하기</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'bible' && (
          <div className="space-y-6">
               <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tighter">
                      <BookOpen className="w-8 h-8 text-indigo-500" />
                      성경 전체 목록
                  </h2>
                  <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm uppercase tracking-widest">{myTotalRead} / {TOTAL_CHAPTERS} Chapters</span>
              </div>

              {!selectedBook ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
                      {BIBLE_BOOKS.map(book => {
                          const readCount = (myProgress[book.id] || []).length;
                          const percent = Math.round((readCount / book.chapters) * 100);
                          return (
                              <button
                                  key={book.id}
                                  onClick={() => setSelectedBook(book)}
                                  className="bg-white p-5 rounded-[1.5rem] shadow-lg border border-slate-100 flex flex-col items-start hover:border-indigo-300 hover:shadow-2xl transition-all group relative overflow-hidden active:scale-95"
                              >
                                  <div className="flex items-center justify-between w-full mb-4">
                                      <span className="font-black text-slate-700 text-lg tracking-tighter">{book.name}</span>
                                      <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-500 transition-colors" />
                                  </div>
                                  <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden mt-1 border border-slate-100 shadow-inner">
                                      <div 
                                          className="bg-indigo-500 h-full transition-all duration-1000 ease-out" 
                                          style={{ width: `${percent}%` }}
                                      />
                                  </div>
                                  <div className="flex justify-between w-full mt-4">
                                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${book.testament === 'Old' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                          {book.testament === 'Old' ? '구약' : '신약'}
                                      </span>
                                      <span className="text-[10px] text-indigo-500 font-black tracking-tighter">{readCount}/{book.chapters}</span>
                                  </div>
                              </button>
                          );
                      })}
                  </div>
              ) : (
                  <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 p-10 animate-in slide-in-from-right-8 duration-500">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-12">
                          <button 
                              onClick={() => setSelectedBook(null)}
                              className="text-indigo-600 font-black flex items-center gap-2 hover:bg-indigo-50 px-6 py-3 rounded-2xl transition-all text-sm group"
                          >
                              <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                              목록으로 돌아가기
                          </button>
                          <div className="text-center">
                              <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{selectedBook.name}</h3>
                              <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em]">{selectedBook.testament} TESTAMENT</p>
                          </div>
                          <div className="bg-indigo-600 text-white px-8 py-3 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 text-xl min-w-[100px] text-center">
                              {Math.round(((myProgress[selectedBook.id]?.length || 0) / selectedBook.chapters) * 100)}%
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                          {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => {
                              const isRead = (myProgress[selectedBook.id] || []).includes(chapter);
                              return (
                                  <button
                                      key={chapter}
                                      onClick={() => toggleChapter(selectedBook.id, chapter)}
                                      className={`aspect-square flex items-center justify-center rounded-2xl text-lg font-black transition-all transform active:scale-90 ${
                                          isRead 
                                              ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50' 
                                              : 'bg-slate-50 text-slate-400 border border-slate-100 hover:border-indigo-300 hover:bg-white hover:text-indigo-500'
                                      }`}
                                  >
                                      {chapter}
                                  </button>
                              );
                          })}
                      </div>
                  </div>
              )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
                  <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-indigo-600" />
                    나의 읽기 비율
                  </h3>
                  <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={105}
                          paddingAngle={10}
                          dataKey="value"
                          stroke="none"
                        >
                          <Cell fill="#4f46e5" />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                        <Tooltip 
                          contentStyle={{borderRadius: '24px', border: 'none', fontWeight: '900', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'}}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-4xl font-black text-indigo-600 tracking-tighter">{myPercent}%</span>
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Progress</span>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative z-10">
                        <Award className="w-12 h-12 text-indigo-200 mb-6" />
                        <h3 className="text-2xl font-black mb-2">{userName ? `${userName} 성도님, 승리하세요!` : "오늘도 승리하셨습니다!"}</h3>
                        <p className="text-indigo-100/80 text-sm font-medium leading-relaxed">
                            매일 조금씩 읽어가는 말씀이 당신의 삶을 변화시키는 가장 큰 힘이 됩니다.
                        </p>
                    </div>
                    <div className="mt-8 bg-indigo-500/30 p-6 rounded-3xl border border-white/10 backdrop-blur-sm relative z-10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase opacity-60">총 완독 장수</span>
                            <span className="bg-white text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black">TOP 5%</span>
                        </div>
                        <div className="text-4xl font-black tracking-tighter">{myTotalRead} / {TOTAL_CHAPTERS}</div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
              <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                <Users className="w-6 h-6 text-indigo-600" />
                공동체 합심 통독 그래프
              </h3>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData} layout="vertical" margin={{ left: 20, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={100} 
                        tick={{ fontSize: 13, fontWeight: '900', fill: '#64748b' }} 
                        axisLine={false} 
                        tickLine={false} 
                    />
                    <Tooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                    />
                    <Bar dataKey="count" radius={[0, 16, 16, 0]} barSize={40}>
                      {statsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'community' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-2 px-2 tracking-tighter">
              <Award className="w-10 h-10 text-yellow-500 fill-current drop-shadow-md" />
              성도들의 통독 소식
            </h2>
            <div className="space-y-4">
              {/* My Community Card */}
              {userName && (
                <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-xl border border-indigo-500 flex items-center gap-6 animate-in slide-in-from-left-4 duration-500">
                  <div className="relative">
                    <div className="w-20 h-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center text-white border-2 border-white/30 backdrop-blur-md">
                      <UserCircle2 className="w-12 h-12" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-indigo-400 w-6 h-6 rounded-full border-4 border-indigo-600 shadow-lg flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex-grow text-white">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-xl tracking-tight">{userName} <span className="text-sm font-bold opacity-60">(나)</span></span>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-white font-black bg-white/10 px-4 py-2 rounded-2xl uppercase border border-white/10">누적 {myTotalRead}장</span>
                         <span className="text-[10px] text-white font-black bg-indigo-500 px-4 py-2 rounded-2xl border border-indigo-400 uppercase">{myPercent}% 달성</span>
                      </div>
                    </div>
                    <p className="text-sm text-indigo-100 font-bold leading-relaxed opacity-90">
                      "오늘도 하나님의 귀한 말씀을 묵상하며 하루를 시작합니다. 함께 승리해요!"
                    </p>
                  </div>
                </div>
              )}

              {communityUsers.map(user => {
                const total = calculateTotalRead(user.progress);
                const percent = ((total / TOTAL_CHAPTERS) * 100).toFixed(0);
                return (
                  <div key={user.id} className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex items-center gap-6 hover:shadow-2xl transition-all group active:scale-[0.98]">
                    <div className="relative">
                      <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-[1.5rem] border-4 border-white shadow-xl ring-4 ring-indigo-50/50" />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-lg"></div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-slate-800 text-xl tracking-tight">{user.name}</span>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] text-indigo-600 font-black bg-indigo-50 px-4 py-2 rounded-2xl uppercase border border-indigo-100 shadow-sm">누적 {total}장</span>
                           <span className="text-[10px] text-emerald-600 font-black bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 uppercase">{percent}% 달성</span>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 font-bold leading-relaxed opacity-80">
                        "{user.name} 성도님이 방금 오늘의 말씀 통독을 완수하고 은혜를 나누었습니다."
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-3xl border-t border-slate-100 flex justify-around items-center p-4 z-50 pb-10 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)]">
        <button onClick={() => { setActiveTab('plan90'); setSelectedBook(null); }} className={`flex flex-col items-center gap-2 transition-all group ${activeTab === 'plan90' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'plan90' ? 'bg-indigo-50' : 'bg-transparent'}`}><Calendar className="w-7 h-7" /></div>
          <span className="text-[9px] font-black uppercase tracking-widest">Plan</span>
        </button>
        <button onClick={() => setActiveTab('bible')} className={`flex flex-col items-center gap-2 transition-all group ${activeTab === 'bible' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'bible' ? 'bg-indigo-50' : 'bg-transparent'}`}><BookOpen className="w-7 h-7" /></div>
          <span className="text-[9px] font-black uppercase tracking-widest">Books</span>
        </button>
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-2 transition-all group ${activeTab === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'stats' ? 'bg-indigo-50' : 'bg-transparent'}`}><BarChart3 className="w-7 h-7" /></div>
          <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
        </button>
        <button onClick={() => setActiveTab('community')} className={`flex flex-col items-center gap-2 transition-all group ${activeTab === 'community' ? 'text-indigo-600 scale-110' : 'text-slate-300 hover:text-slate-500'}`}>
          <div className={`p-2 rounded-xl transition-colors ${activeTab === 'community' ? 'bg-indigo-50' : 'bg-transparent'}`}><Users className="w-7 h-7" /></div>
          <span className="text-[9px] font-black uppercase tracking-widest">Group</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
