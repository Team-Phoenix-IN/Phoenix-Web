import { useScrollProgress } from '../hooks/useScrollProgress';

export default function ScrollToTop() {
    const { isVisible, progress, scrollToTop } = useScrollProgress();
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress * circumference);

    return (
        <div
            id="scroll-to-top"
            className={isVisible ? 'visible' : ''}
            onClick={scrollToTop}
        >
            <svg className="progress-ring" viewBox="0 0 100 100">
                <circle className="scroll-bg" cx="50" cy="50" r="45"></circle>
                <circle
                    className="scroll-progress"
                    cx="50" cy="50" r="45"
                    style={{
                        strokeDasharray: `${circumference} ${circumference}`,
                        strokeDashoffset: offset
                    }}
                ></circle>
            </svg>
            <svg className="scroll-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
        </div>
    );
}
