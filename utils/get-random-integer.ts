export const getRandomInteger = (from: number, to: number, without: number[] = []) => {
  const allowedNumbers = Array(to - from)
    .fill(null)
    .map((_, index) => index + from)
    .filter(number => !without.includes(number));

  return allowedNumbers[Math.floor(Math.random() * allowedNumbers.length)];
};
