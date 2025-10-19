
import { useAppContext } from '../context/AppContext';

export const useTranslations = () => {
    const { t, language, setLanguage } = useAppContext();
    return { t, language, setLanguage };
};
