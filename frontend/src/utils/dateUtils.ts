/**
 * Format a date string to a localized date format
 * @param dateString ISO date string
 * @returns Formatted date (e.g., "May 1, 2023")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format a date string to a localized date and time format
 * @param dateString ISO date string
 * @returns Formatted date and time (e.g., "May 1, 2023, 2:30 PM")
 */
export const formatDateTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format time in minutes to hours and minutes
 * @param minutes Total minutes
 * @returns Formatted time (e.g., "1h 30m")
 */
export const formatTimeFromMinutes = (minutes: number): string => {
  if (!minutes) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes > 0 ? remainingMinutes + 'm' : ''}`;
  }
  return `${remainingMinutes}m`;
}; 