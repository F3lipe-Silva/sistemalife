
import { Alert } from 'react-native';

export const useToast = () => {
  const toast = ({ title, description, variant }: { title: string, description?: string, variant?: 'destructive' | 'default' }) => {
    Alert.alert(title, description);
  };
  return { toast };
};
