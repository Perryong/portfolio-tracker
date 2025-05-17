
// Get chart colors based on theme
export const getChartColors = (isDarkMode: boolean) => {
  return {
    background: isDarkMode ? '#1a1f2c' : '#FFFFFF',
    text: isDarkMode ? '#E0E0E0' : '#333333',
    grid: isDarkMode ? '#2a2e39' : '#F0F3FA',
    border: isDarkMode ? '#3c3e4a' : '#D9D9D9',
    upColor: '#4CAF50',
    downColor: '#FF5252',
    wickUpColor: '#4CAF50',
    wickDownColor: '#FF5252',
  };
};
