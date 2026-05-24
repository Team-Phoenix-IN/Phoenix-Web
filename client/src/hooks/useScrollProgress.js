import { useState, useEffect, useCallback } from 'react';

export function useScrollProgress() {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const radius = 45;
        const circumference = 2 * Math.PI * radius;

        function handleScroll() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;

            setIsVisible(scrollTop > 150);

            if (scrollHeight > 0) {
                setProgress(scrollTop / scrollHeight);
            }
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return { isVisible, progress, scrollToTop };
}
