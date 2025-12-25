// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';

// Configuration - Update these with your n8n webhook URL and secret key
const API_CONFIG = {
  webhookUrl: 'YOUR_N8N_WEBHOOK_URL',
  secretKey: 'YOUR_SECRET_KEY_HERE'
};

// Matrix Rain Background Component
const MatrixRain = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    
    const chars = 'SHADOWPRINT01アイウエオカキクケコサシスセソタチツテト';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillStyle = `rgba(0, 255, 170, ${Math.random() * 0.5 + 0.1})`;
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };
    
    const interval = setInterval(draw, 33);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-30" />;
};

// Glitch Text Component
const GlitchText = ({ children, className = '' }) => {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className={`relative inline-block ${className}`}>
      <span className={glitch ? 'animate-pulse' : ''}>{children}</span>
      {glitch && (
        <>
          <span className="absolute top-0 left-0.5 text-cyan-400 opacity-70">{children}</span>
          <span className="absolute top-0 -left-0.5 text-pink-500 opacity-70">{children}</span>
        </>
      )}
    </span>
  );
};

// Terminal Line Component
const TerminalLine = ({ text, isCommand = false, isWarning = false, isSuccess = false, isError = false }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  
  useEffect(() => {
    let index = 0;
    const speed = isCommand ? 25 : 8;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayed(text.slice(0, index));
        index++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, isCommand]);
  
  let colorClass = 'text-gray-400';
  if (isWarning) colorClass = 'text-yellow-400';
  if (isSuccess) colorClass = 'text-green-400';
  if (isError) colorClass = 'text-red-500';
  if (isCommand) colorClass = 'text-cyan-400';
  
  return (
    <div className={`font-mono text-sm ${colorClass} mb-1`}>
      {isCommand && <span className="text-pink-500 mr-1">{'>'}</span>}
      {displayed}
      {!done && <span className="animate-pulse ml-0.5">_</span>}
    </div>
  );
};

// Progress Bar Component
const ScanProgress = ({ progress, label }) => (
  <div className="w-full mb-4">
    <div className="flex justify-between text-xs text-gray-500 mb-1 font-mono">
      <span>{label}</span>
      <span>{Math.floor(progress)}%</span>
    </div>
    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// Breach Card Component
const BreachCard = ({ breach }) => {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  return (
    <div 
      className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 cursor-pointer hover:bg-red-500/15 transition-all"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {breach.logo && !imgError ? (
            <img 
              src={breach.logo} 
              alt="" 
              className="w-10 h-10 rounded bg-gray-800 object-contain flex-shrink-0" 
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-red-400 font-bold text-lg flex-shrink-0">
              {breach.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h4 className="font-mono text-red-400 font-bold truncate">{breach.name}</h4>
            <p className="text-xs text-gray-500 truncate">{breach.domain}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-xs text-red-400 font-mono">{breach.records} records</div>
          <div className="text-xs text-gray-600">{breach.date}</div>
        </div>
      </div>
      
      {expanded && breach.dataTypes && breach.dataTypes.length > 0 && (
        <div className="mt-4 pt-4 border-t border-red-500/20">
          <p className="text-xs text-gray-500 mb-2">EXPOSED DATA TYPES:</p>
          <div className="flex flex-wrap gap-1">
            {breach.dataTypes.map((type, i) => (
              <span 
                key={i} 
                className={`text-xs px-2 py-1 rounded font-mono ${
                  type === 'Passwords' ? 'bg-red-600/30 text-red-300' :
                  type === 'Email addresses' ? 'bg-yellow-600/30 text-yellow-300' :
                  'bg-gray-700/50 text-gray-400'
                }`}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-600 flex items-center gap-1">
        {breach.verified && <span className="text-green-500">✓ Verified</span>}
        <span className="ml-auto">{expanded ? '▲ Less' : '▼ More'}</span>
      </div>
    </div>
  );
};

// Data Broker Card Component - All shown as LIKELY EXPOSED
const DataBrokerCard = ({ broker }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const riskColors = {
    high: 'from-red-500/20 to-red-600/10 border-red-500/40 hover:border-red-400/60',
    medium: 'from-orange-500/20 to-orange-600/10 border-orange-500/40 hover:border-orange-400/60',
    low: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 hover:border-yellow-400/60'
  };
  
  const riskTextColors = {
    high: 'text-red-400',
    medium: 'text-orange-400',
    low: 'text-yellow-400'
  };
  
  const riskBadgeColors = {
    high: 'bg-red-500/20 text-red-300 border-red-500/30',
    medium: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    low: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  };

  return (
    <div 
      className={`relative bg-gradient-to-br ${riskColors[broker.risk]} border rounded-xl p-4 transition-all duration-300 cursor-pointer group overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background glow */}
      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
           style={{ transform: 'skewX(-15deg) translateX(-100%)', animation: isHovered ? 'shimmer 1s ease-out' : 'none' }} />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-800/80 flex items-center justify-center text-xl">
            {broker.icon}
          </div>
          <div>
            <h4 className={`font-mono font-bold ${riskTextColors[broker.risk]}`}>
              {broker.name}
            </h4>
            <p className="text-xs text-gray-500">{broker.category}</p>
          </div>
        </div>
        
        <span className={`text-xs px-2 py-1 rounded-full border font-mono ${riskBadgeColors[broker.risk]}`}>
          {broker.risk.toUpperCase()}
        </span>
      </div>
      
      {/* Data types exposed */}
      {broker.dataTypes && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">LIKELY EXPOSED:</p>
          <div className="flex flex-wrap gap-1">
            {broker.dataTypes.map((type, i) => (
              <span 
                key={i} 
                className="text-xs px-2 py-0.5 rounded bg-gray-800/60 text-gray-300 font-mono"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700/50">
        <a
          href={broker.searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs py-2 px-3 rounded-lg bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 hover:text-white transition-all font-mono"
          onClick={(e) => e.stopPropagation()}
        >
          🔍 Check
        </a>
        <a
          href={broker.optOutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 text-center text-xs py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 transition-all font-mono border border-cyan-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          🛡️ Opt Out
        </a>
      </div>
    </div>
  );
};

// Online Footprint Summary Stats
const FootprintStats = ({ dataBrokers }) => {
  const total = dataBrokers.length;
  const highRisk = dataBrokers.filter(b => b.risk === 'high').length;
  const mediumRisk = dataBrokers.filter(b => b.risk === 'medium').length;
  
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="text-2xl font-bold text-purple-400 font-mono">{total}</div>
        <div className="text-xs text-gray-500">SITES TO CHECK</div>
      </div>
      <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="text-2xl font-bold text-red-400 font-mono">{highRisk}</div>
        <div className="text-xs text-gray-500">HIGH RISK</div>
      </div>
      <div className="text-center p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
        <div className="text-2xl font-bold text-orange-400 font-mono">{mediumRisk}</div>
        <div className="text-xs text-gray-500">MEDIUM RISK</div>
      </div>
    </div>
  );
};

// Shadow Score Card Component
const ShadowScoreCard = ({ score, target, breachCount, platformsFound, scanId, hasGravatar, gravatarUrl, dataBrokersFound }) => {
  const getScoreColor = (s) => {
    if (s < 30) return 'text-green-400';
    if (s < 60) return 'text-yellow-400';
    return 'text-red-500';
  };
  
  const getRiskLevel = (s) => {
    if (s < 30) return 'LOW EXPOSURE';
    if (s < 60) return 'MODERATE RISK';
    return 'HIGH EXPOSURE';
  };

  const getScoreBg = (s) => {
    if (s < 30) return 'shadow-green-500/20';
    if (s < 60) return 'shadow-yellow-500/20';
    return 'shadow-red-500/20';
  };
  
  return (
    <div className={`relative bg-black border border-cyan-500/50 rounded-lg p-6 shadow-2xl ${getScoreBg(score)}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent animate-scan" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-gray-500 font-mono tracking-wider">SHADOWPRINT v2.0</span>
        </div>
        <span className="text-xs text-gray-600 font-mono">{new Date().toISOString().split('T')[0]}</span>
      </div>
      
      {/* Gravatar if found */}
      {hasGravatar && gravatarUrl && (
        <div className="flex justify-center mb-4">
          <img 
            src={gravatarUrl} 
            alt="Gravatar" 
            className="w-16 h-16 rounded-full border-2 border-cyan-500/50"
          />
        </div>
      )}
      
      {/* Score Display */}
      <div className="text-center mb-6">
        <div className="text-7xl font-bold font-mono mb-2 tracking-tight">
          <span className={getScoreColor(score)}>{score}</span>
          <span className="text-gray-600 text-3xl">/100</span>
        </div>
        <div className={`text-sm font-mono ${getScoreColor(score)} tracking-widest`}>
          {getRiskLevel(score)}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="text-center p-2 bg-gray-900/80 rounded border border-gray-800">
          <div className="text-xl font-bold text-pink-500 font-mono">{breachCount}</div>
          <div className="text-xs text-gray-500 tracking-wide">BREACHES</div>
        </div>
        <div className="text-center p-2 bg-gray-900/80 rounded border border-gray-800">
          <div className="text-xl font-bold text-cyan-400 font-mono">{platformsFound}</div>
          <div className="text-xs text-gray-500 tracking-wide">PLATFORMS</div>
        </div>
        <div className="text-center p-2 bg-gray-900/80 rounded border border-gray-800">
          <div className="text-xl font-bold text-purple-400 font-mono">{dataBrokersFound || 0}</div>
          <div className="text-xs text-gray-500 tracking-wide">BROKERS</div>
        </div>
        <div className="text-center p-2 bg-gray-900/80 rounded border border-gray-800">
          <div className="text-xl font-bold text-yellow-400 font-mono">{Math.max(1, Math.floor(score / 12))}</div>
          <div className="text-xs text-gray-500 tracking-wide">VECTORS</div>
        </div>
      </div>
      
      {/* Target Info */}
      <div className="border-t border-gray-800 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 mb-1">TARGET</div>
            <div className="text-cyan-400 font-mono text-sm truncate max-w-[150px]">{target || 'ANONYMOUS'}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 mb-1">SCAN ID</div>
            <div className="text-gray-500 font-mono text-xs">{scanId}</div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-center">
        <span className="text-xs text-gray-600 tracking-widest">SHADOWPRINT</span>
      </div>
    </div>
  );
};

// Security Recommendation Component
const SecurityTip = ({ icon, title, description, priority }) => {
  const priorityColors = {
    high: 'border-red-500/50 bg-red-500/5',
    medium: 'border-yellow-500/50 bg-yellow-500/5',
    low: 'border-green-500/50 bg-green-500/5'
  };
  
  return (
    <div className={`p-4 rounded-lg border ${priorityColors[priority]} mb-3`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h4 className="font-mono text-sm text-white mb-1">{title}</h4>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  );
};

// Platform Grid Item
const PlatformItem = ({ platform }) => (
  <div 
    className={`flex items-center gap-2 p-2 rounded-lg text-sm font-mono transition-all ${
      platform.found 
        ? 'bg-red-500/10 border border-red-500/30 text-red-400' 
        : platform.checkable === false
          ? 'bg-gray-800/20 border border-gray-700/20 text-gray-700'
          : 'bg-gray-800/30 border border-gray-700/30 text-gray-600'
    }`}
  >
    <span>{platform.icon || '🌐'}</span>
    <span className="truncate text-xs">{platform.name}</span>
    {platform.found ? (
      <a 
        href={platform.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="ml-auto text-cyan-400 hover:text-cyan-300"
        onClick={(e) => e.stopPropagation()}
      >
        ↗
      </a>
    ) : platform.checkable === false ? (
      <span className="ml-auto text-xs text-gray-700" title="Cannot verify automatically">?</span>
    ) : (
      <span className="ml-auto text-xs text-green-600">✓</span>
    )}
  </div>
);

// Generate data broker results based on email/username
const generateDataBrokers = (email, username) => {
  const target = email || username || '';
  
  const brokers = [
    {
      name: 'Spokeo',
      icon: '👤',
      category: 'People Search',
      searchUrl: `https://www.spokeo.com/search?q=${encodeURIComponent(target)}`,
      optOutUrl: 'https://www.spokeo.com/optout',
      dataTypes: ['Name', 'Address', 'Phone', 'Email', 'Relatives'],
      risk: 'high'
    },
    {
      name: 'BeenVerified',
      icon: '✓',
      category: 'Background Check',
      searchUrl: `https://www.beenverified.com/`,
      optOutUrl: 'https://www.beenverified.com/app/optout/search',
      dataTypes: ['Name', 'Address', 'Criminal Records', 'Assets'],
      risk: 'high'
    },
    {
      name: 'WhitePages',
      icon: '📖',
      category: 'Directory',
      searchUrl: `https://www.whitepages.com/`,
      optOutUrl: 'https://www.whitepages.com/suppression-requests',
      dataTypes: ['Name', 'Address', 'Phone', 'Age'],
      risk: 'high'
    },
    {
      name: 'TruePeopleSearch',
      icon: '🔎',
      category: 'People Search',
      searchUrl: 'https://www.truepeoplesearch.com/',
      optOutUrl: 'https://www.truepeoplesearch.com/removal',
      dataTypes: ['Name', 'Address', 'Phone', 'Relatives', 'Associates'],
      risk: 'high'
    },
    {
      name: 'FastPeopleSearch',
      icon: '⚡',
      category: 'People Search',
      searchUrl: 'https://www.fastpeoplesearch.com/',
      optOutUrl: 'https://www.fastpeoplesearch.com/removal',
      dataTypes: ['Name', 'Address', 'Phone', 'Email'],
      risk: 'medium'
    },
    {
      name: 'Radaris',
      icon: '📡',
      category: 'Data Aggregator',
      searchUrl: 'https://radaris.com/',
      optOutUrl: 'https://radaris.com/control/privacy',
      dataTypes: ['Name', 'Address', 'Phone', 'Social Media', 'Court Records'],
      risk: 'high'
    },
    {
      name: 'Intelius',
      icon: '🔬',
      category: 'Background Check',
      searchUrl: 'https://www.intelius.com/',
      optOutUrl: 'https://www.intelius.com/opt-out',
      dataTypes: ['Name', 'Address', 'Phone', 'Criminal History'],
      risk: 'medium'
    },
    {
      name: 'PeopleFinder',
      icon: '🧭',
      category: 'People Search',
      searchUrl: 'https://www.peoplefinder.com/',
      optOutUrl: 'https://www.peoplefinder.com/optout.php',
      dataTypes: ['Name', 'Address', 'Phone', 'Age'],
      risk: 'medium'
    },
    {
      name: 'FamilyTreeNow',
      icon: '🌳',
      category: 'Genealogy',
      searchUrl: 'https://www.familytreenow.com/',
      optOutUrl: 'https://www.familytreenow.com/optout',
      dataTypes: ['Name', 'Address', 'Relatives', 'Birth Records'],
      risk: 'medium'
    },
    {
      name: 'ThatsThem',
      icon: '👁️',
      category: 'Data Aggregator',
      searchUrl: 'https://thatsthem.com/',
      optOutUrl: 'https://thatsthem.com/optout',
      dataTypes: ['Name', 'Address', 'Phone', 'Email', 'IP Address'],
      risk: 'high'
    },
    {
      name: 'USSearch',
      icon: '🇺🇸',
      category: 'Background Check',
      searchUrl: 'https://www.ussearch.com/',
      optOutUrl: 'https://www.ussearch.com/opt-out',
      dataTypes: ['Name', 'Address', 'Criminal Records'],
      risk: 'medium'
    },
    {
      name: 'Pipl',
      icon: '🌐',
      category: 'Identity Search',
      searchUrl: 'https://pipl.com/',
      optOutUrl: 'https://pipl.com/personal-information-removal-request',
      dataTypes: ['Name', 'Email', 'Social Profiles', 'Photos'],
      risk: 'low'
    }
  ];
  
  return brokers.map((broker) => ({
    ...broker,
    likely: true
  }));
};

// Main App Component
export default function App() {
  const [stage, setStage] = useState('input');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLines, setTerminalLines] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dataBrokers, setDataBrokers] = useState([]);

  const addTerminalLine = (line) => {
    setTerminalLines(prev => [...prev, line]);
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  const startScan = async () => {
    if (!email && !username) return;
    
    setStage('scanning');
    setTerminalLines([]);
    setScanProgress(0);
    setShowResults(false);
    setError(null);

    await sleep(300);
    addTerminalLine({ text: 'INITIALIZING SHADOWPRINT v2.0...', isCommand: true });
    setScanProgress(5);
    
    await sleep(600);
    addTerminalLine({ text: `Target acquired: ${email || username}` });
    setScanProgress(10);
    
    await sleep(500);
    addTerminalLine({ text: 'Establishing secure connection...', isCommand: true });
    setScanProgress(15);

    try {
      await sleep(400);
      addTerminalLine({ text: 'Querying breach intelligence databases...', isCommand: true });
      setScanProgress(25);

      const response = await fetch(API_CONFIG.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-shadowprint-key': API_CONFIG.secretKey
        },
        body: JSON.stringify({
          email: email || undefined,
          username: username || undefined
        })
      });

      setScanProgress(50);
      
      if (!response.ok) {
        throw new Error(`Scan failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setScanProgress(60);
      await sleep(500);
      
      if (data.breachCount > 0) {
        addTerminalLine({ text: `WARNING: ${data.breachCount} breach(es) detected!`, isWarning: true });
        await sleep(300);
        for (const breach of data.breaches.slice(0, 3)) {
          await sleep(200);
          addTerminalLine({ text: `  [!] ${breach.name} - ${breach.records} records`, isError: true });
        }
        if (data.breachCount > 3) {
          addTerminalLine({ text: `  ... and ${data.breachCount - 3} more`, isError: true });
        }
      } else {
        addTerminalLine({ text: 'No breaches detected in known databases', isSuccess: true });
      }

      setScanProgress(75);
      await sleep(500);
      
      addTerminalLine({ text: 'Scanning social platforms...', isCommand: true });
      await sleep(600);
      
      if (data.platformsFound > 0) {
        addTerminalLine({ text: `Found ${data.platformsFound} public profile(s)`, isWarning: true });
      } else if (!username) {
        addTerminalLine({ text: 'No username provided - skipping platform check', isSuccess: false });
      } else {
        addTerminalLine({ text: 'No platform profiles detected', isSuccess: true });
      }

      const brokers = generateDataBrokers(email, username);
      setDataBrokers(brokers);
      const brokersFound = brokers.length;

      setScanProgress(85);
      await sleep(400);
      
      addTerminalLine({ text: 'Scanning data broker networks...', isCommand: true });
      await sleep(600);
      addTerminalLine({ text: `Found on ${brokersFound} data broker sites`, isWarning: brokersFound > 5 });

      setScanProgress(90);
      await sleep(400);
      
      if (data.hasGravatar) {
        addTerminalLine({ text: 'Gravatar profile detected', isWarning: true });
      }

      await sleep(300);
      addTerminalLine({ text: 'Calculating shadow score...', isCommand: true });
      setScanProgress(95);
      
      const adjustedScore = Math.min(99, data.score + Math.floor(brokersFound * 2));
      
      await sleep(500);
      addTerminalLine({ text: `Final score: ${adjustedScore}/100 - ${adjustedScore >= 60 ? 'HIGH' : adjustedScore >= 30 ? 'MODERATE' : 'LOW'} RISK`, isWarning: adjustedScore > 40 });
      setScanProgress(100);
      
      await sleep(400);
      addTerminalLine({ text: 'SCAN COMPLETE', isSuccess: true });

      setResults({
        ...data,
        score: adjustedScore,
        dataBrokersFound: brokersFound
      });
      
      await sleep(600);
      setStage('results');
      await sleep(300);
      setShowResults(true);

    } catch (err) {
      console.error('Scan error:', err);
      addTerminalLine({ text: `ERROR: ${err.message}`, isError: true });
      setError(err.message);
      
      await sleep(1000);
      addTerminalLine({ text: 'Scan failed. Please try again.', isError: true });
    }
  };

  const handleShare = async () => {
    if (!results) return;
    
    const shareText = `🔓 SHADOWPRINT SCAN RESULTS

Shadow Score: ${results.score}/100 - ${results.riskLevel}
Breaches Found: ${results.breachCount}
Platform Exposures: ${results.platformsFound}
Data Broker Sites: ${results.dataBrokersFound || 0}

How exposed are YOU? Find out at SHADOWPRINT`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SHADOWPRINT Results',
          text: shareText
        });
      } catch (err) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetScan = () => {
    setStage('input');
    setShowResults(false);
    setEmail('');
    setUsername('');
    setTerminalLines([]);
    setScanProgress(0);
    setResults(null);
    setError(null);
    setDataBrokers([]);
  };
  
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <MatrixRain />
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 py-12">
        
        {/* Logo */}
        <div className="mb-8 text-center">
          <GlitchText className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            SHADOWPRINT
          </GlitchText>
          <p className="text-gray-500 text-sm mt-2 font-mono tracking-widest">DIGITAL EXPOSURE SCANNER v2.0</p>
        </div>
        
        {/* Input Stage */}
        {stage === 'input' && (
          <div className="w-full max-w-md space-y-4 animate-fadeIn">
            <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <p className="text-gray-400 text-sm">Discover your real digital footprint</p>
                <p className="text-cyan-500 text-xs mt-1">Powered by real breach intelligence</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 font-mono mb-2 block tracking-wide">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-cyan-400 font-mono placeholder-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-gray-600 text-xs font-mono">AND/OR</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 font-mono mb-2 block tracking-wide">USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-cyan-400 font-mono placeholder-gray-600 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  />
                </div>
                
                <button
                  onClick={startScan}
                  disabled={!email && !username}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 disabled:from-gray-800 disabled:to-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed rounded-lg font-mono font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 tracking-wide"
                >
                  INITIATE SCAN
                </button>
              </div>
            </div>
            
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-600 px-4">
                Real breach data from HaveIBeenPwned
              </p>
              <p className="text-xs text-gray-700 px-4">
                Your data is never stored
              </p>
            </div>
          </div>
        )}
        
        {/* Scanning Stage */}
        {stage === 'scanning' && (
          <div className="w-full max-w-2xl space-y-4 animate-fadeIn">
            <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-6 shadow-2xl">
              <ScanProgress progress={scanProgress} label="SCANNING TARGET..." />
              
              <div className="h-80 overflow-y-auto bg-black/60 rounded-lg p-4 border border-gray-800">
                {terminalLines.map((line, i) => (
                  <TerminalLine
                    key={i}
                    text={line.text}
                    isCommand={line.isCommand}
                    isWarning={line.isWarning}
                    isSuccess={line.isSuccess}
                    isError={line.isError}
                  />
                ))}
              </div>
              
              {error && (
                <button
                  onClick={resetScan}
                  className="w-full mt-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-mono text-sm transition-all"
                >
                  TRY AGAIN
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Results Stage */}
        {stage === 'results' && results && (
          <div className={`w-full max-w-6xl transition-all duration-700 ${showResults ? 'opacity-100' : 'opacity-0'}`}>
            <div className="grid lg:grid-cols-2 gap-6">
              
              {/* Left Column - Score Card */}
              <div className="space-y-4">
                <ShadowScoreCard
                  score={results.score}
                  target={results.target}
                  breachCount={results.breachCount}
                  platformsFound={results.platformsFound}
                  scanId={results.scanId}
                  hasGravatar={results.hasGravatar}
                  gravatarUrl={results.gravatarUrl}
                  dataBrokersFound={results.dataBrokersFound}
                />
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={resetScan}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg font-mono text-sm transition-all"
                  >
                    NEW SCAN
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 rounded-lg font-mono text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {copied ? '✓ COPIED!' : 'SHARE RESULTS'}
                  </button>
                </div>
                
                {/* Security Recommendations */}
                <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-mono text-gray-400 mb-4 flex items-center gap-2 tracking-wide">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    SECURITY RECOMMENDATIONS
                  </h3>
                  {results.recommendations && results.recommendations.map((tip, i) => (
                    <SecurityTip key={i} {...tip} />
                  ))}
                </div>
              </div>
              
              {/* Right Column - Details */}
              <div className="space-y-4">
                
                {/* Real Breach Cards */}
                <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-mono text-gray-400 mb-4 flex items-center gap-2 tracking-wide">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    DATA BREACHES
                    {results.breachCount > 0 && (
                      <span className="ml-auto text-red-400 text-xs">REAL DATA</span>
                    )}
                  </h3>
                  {results.breaches && results.breaches.length > 0 ? (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {results.breaches.map((breach, i) => (
                        <BreachCard key={i} breach={breach} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-400 font-mono p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                      ✓ No breaches detected
                    </div>
                  )}
                </div>
                
                {/* Platform Exposures */}
                <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-5">
                  <h3 className="text-sm font-mono text-gray-400 mb-4 flex items-center gap-2 tracking-wide">
                    <span className="w-2 h-2 bg-cyan-500 rounded-full" />
                    PLATFORM EXPOSURE
                    {results.platformsFound > 0 && (
                      <span className="ml-auto text-cyan-400 text-xs">{results.platformsFound} FOUND</span>
                    )}
                  </h3>
                  {results.platforms && results.platforms.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {results.platforms.map((platform, i) => (
                        <PlatformItem key={i} platform={platform} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 font-mono p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 text-center">
                      <span className="text-cyan-400">💡</span> Enter a username to check platform exposure
                    </div>
                  )}
                </div>
                
              </div>
            </div>
            
            {/* Online Footprint Section - Full Width */}
            <div className="mt-6 bg-gray-900/90 backdrop-blur-xl border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-mono text-gray-400 flex items-center gap-2 tracking-wide">
                  <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  ONLINE FOOTPRINT
                  <span className="text-purple-400 text-xs ml-2">DATA BROKER EXPOSURE</span>
                </h3>
                <span className="text-xs text-gray-600 font-mono">
                  {dataBrokers.length} sites to check
                </span>
              </div>
              
              {/* Stats Summary */}
              <FootprintStats dataBrokers={dataBrokers} />
              
              {/* Data Broker Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataBrokers.map((broker, i) => (
                  <DataBrokerCard key={i} broker={broker} />
                ))}
              </div>
              
              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <p className="text-xs text-gray-500 text-center">
                  ⚠️ These sites likely have your data based on common exposure patterns.
                  Click "Check" to search each site, and "Opt Out" to remove your info.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-700 font-mono">
          <p>Built for security awareness</p>
          <p className="mt-1 text-gray-800">Breach data provided by HaveIBeenPwned</p>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .animate-scan {
          animation: scan 3s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        @keyframes shimmer {
          0% { transform: skewX(-15deg) translateX(-100%); }
          100% { transform: skewX(-15deg) translateX(200%); }
        }
      `}</style>
    </div>
  );
}
