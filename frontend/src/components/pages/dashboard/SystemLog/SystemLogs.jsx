import { useState, useEffect } from "react";
import { BlockContentWrap } from "../../../../styles/global/default";

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);

  const loadLogs = () => {
    const savedLogs = JSON.parse(localStorage.getItem('system_logs') || '[]');
    setLogs(savedLogs);
  };

  useEffect(() => {
    loadLogs();
    window.addEventListener('system_logs_updated', loadLogs);
    return () => window.removeEventListener('system_logs_updated', loadLogs);
  }, []);

  // Replaced emoji balls with terminal-style text tags and colors
  const getLogTag = (type) => {
    switch(type) {
      case 'success': return <span style={{ color: '#4ade80' }}>[ OK ]</span>;  // Green
      case 'warning': return <span style={{ color: '#facc15' }}>[WARN]</span>;  // Yellow
      case 'error':   return <span style={{ color: '#f87171' }}>[ERR ]</span>;  // Red
      default:        return <span style={{ color: '#60a5fa' }}>[INFO]</span>;  // Blue
    }
  };

  return (
    <BlockContentWrap 
      style={{ 
        padding: '20px', 
        backgroundColor: '#0f172a', /* Deep slate/black terminal background */
        borderRadius: '12px', 
        maxHeight: '350px', 
        overflowY: 'auto',
        fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace", /* Monospace font for the code look */
        color: '#cbd5e1', /* Light gray text */
        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      {/* Terminal Header (with Mac/Linux style window dots) */}
      <div style={{ 
        borderBottom: '1px solid #334155', 
        paddingBottom: '12px', 
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
        </div>
        <h3 style={{ color: '#64748b', fontSize: '13px', margin: 0, fontWeight: 'normal', letterSpacing: '1px' }}>
          bash: root/timetabling/logs.sh
        </h3>
      </div>
      
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {logs.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b' }}>&gt; Waiting for system events...</p>
        ) : (
          logs.map((log) => (
            <li key={log.id} style={{ 
              padding: '6px 0', 
              fontSize: '13px', 
              display: 'flex', 
              gap: '12px',
              lineHeight: '1.5'
            }}>
              {/* Dimmed timestamp */}
              <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{log.timestamp}</span>
              
              {/* Status Tag */}
              <span style={{ fontWeight: 'bold' }}>{getLogTag(log.type)}</span>
              
              {/* Log Message */}
              <span dangerouslySetInnerHTML={{ __html: log.message }} style={{ color: '#e2e8f0' }}></span>
            </li>
          ))
        )}
        {/* Blinking cursor effect at the bottom */}
        {logs.length > 0 && (
          <li style={{ padding: '6px 0', fontSize: '13px', color: '#64748b' }}>
            &gt; <span style={{ animation: 'blink 1s step-end infinite' }}>_</span>
            <style>
              {`@keyframes blink { 50% { opacity: 0; } }`}
            </style>
          </li>
        )}
      </ul>
    </BlockContentWrap>
  );
};

export default SystemLogs;