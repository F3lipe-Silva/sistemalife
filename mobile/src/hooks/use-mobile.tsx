
import { useWindowDimensions, Platform } from 'react-native';

export function useIsMobile() {
  const { width } = useWindowDimensions();
  // On React Native, it is always "mobile" (or tablet), but for layout purposes we can check width
  // Breakpoint commonly used is 768px
  return width < 768;
}
