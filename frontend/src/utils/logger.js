export const addSystemLog = (message, type = 'info') => {
  const existingLogs = JSON.parse(localStorage.getItem('system_logs') || '[]');
  
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    message,
    type
  };

  const updatedLogs = [newLog, ...existingLogs].slice(0, 15);
  localStorage.setItem('system_logs', JSON.stringify(updatedLogs));

  // Dispatch a custom browser event so any component listening can update instantly
  window.dispatchEvent(new Event('system_logs_updated'));
};