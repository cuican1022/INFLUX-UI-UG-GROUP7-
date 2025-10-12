import { toast } from 'vue-sonner';
import { parseError } from './parseError';

export const handleError = (title: string, error: unknown) => {
  const description = parseError(error);

  toast.error(title, { description });
};
