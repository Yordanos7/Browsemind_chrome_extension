export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60; //this calculates the remaining minutes after converting to hours for example: // 125 minutes will be 2 hours and 5 minutes
  if (hours > 0) {
    return `${hours}hr ${mins}min`;
  } else {
    return `${mins}min`;
  }
};

export const formatSeconds = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60; // this calculates the remaining seconds after converting to minutes for example: // 125 seconds will be 2 minutes and 5 seconds
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`; // this formats the minutes and seconds to always be two digits example: // 2 minutes and 5 seconds will be formatted as 02:05 // padstart is used to ensure that single digit minutes and seconds are displayed with a leading zero
};
