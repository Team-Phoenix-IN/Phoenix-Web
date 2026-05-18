import { useRef, useCallback, useEffect } from 'react';

export default function ChromaGrid({
    items = [],
    radius = 300,
    damping = 0.55,
    fadeOut = 0.5,
    className = '',
    renderCardFront,
    onCardClick,
}) {
    const containerRef = useRef(null);
    const spotRef = useRef(null);
    const cardRefs = useRef([]);
    const rafRef = useRef(null);
    const curTarget = useRef({ x: -9999, y: -9999 });
    const curActual = useRef({ x: -9999, y: -9999 });
    const activeRef = useRef(false);
    const fadeTimerRef = useRef(null);

    const lerp = (a, b, t) => a + (b - a) * t;

    // Update --proximity on each card based on distance to cursor
    const updateProximities = useCallback((mx, my) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        cardRefs.current.forEach(card => {
            if (!card) return;
            const cr = card.getBoundingClientRect();
            const cx = cr.left - rect.left + cr.width / 2;
            const cy = cr.top - rect.top + cr.height / 2;
            const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
            const prox = Math.max(0, 1 - dist / radius);
            card.style.setProperty('--proximity', prox.toFixed(3));
        });
    }, [radius]);

    const clearProximities = useCallback((animated = true) => {
        cardRefs.current.forEach(card => {
            if (!card) return;
            if (animated) {
                // Let CSS transition handle the fade
                card.style.setProperty('--proximity', '0');
            } else {
                card.style.setProperty('--proximity', '0');
            }
        });
    }, []);

    const tick = useCallback(() => {
        curActual.current.x = lerp(curActual.current.x, curTarget.current.x, 1 - damping);
        curActual.current.y = lerp(curActual.current.y, curTarget.current.y, 1 - damping);

        if (spotRef.current) {
            spotRef.current.style.left = `${curActual.current.x}px`;
            spotRef.current.style.top = `${curActual.current.y}px`;
        }

        updateProximities(curActual.current.x, curActual.current.y);
        rafRef.current = requestAnimationFrame(tick);
    }, [damping, updateProximities]);

    const handleMouseMove = useCallback((e) => {
        const rect = containerRef.current.getBoundingClientRect();
        curTarget.current.x = e.clientX - rect.left;
        curTarget.current.y = e.clientY - rect.top;

        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

        if (!activeRef.current) {
            activeRef.current = true;
            curActual.current.x = curTarget.current.x;
            curActual.current.y = curTarget.current.y;
            if (spotRef.current) spotRef.current.style.opacity = '1';
            rafRef.current = requestAnimationFrame(tick);
        }
    }, [tick]);

    const handleMouseLeave = useCallback(() => {
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = setTimeout(() => {
            activeRef.current = false;
            if (spotRef.current) spotRef.current.style.opacity = '0';
            cancelAnimationFrame(rafRef.current);
            clearProximities();
        }, fadeOut * 1000);
    }, [fadeOut, clearProximities]);

    useEffect(() => {
        return () => {
            cancelAnimationFrame(rafRef.current);
            if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className={`chroma-grid ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Ambient spotlight glow */}
            <div
                ref={spotRef}
                className="chroma-spotlight"
                style={{ width: radius * 2, height: radius * 2, opacity: 0 }}
            />

            {items.map((item, idx) => (
                <div
                    key={idx}
                    ref={el => cardRefs.current[idx] = el}
                    className="chroma-card-wrapper"
                    style={{
                        '--border-color': item.borderColor || 'rgba(255,255,255,0.15)',
                        '--card-gradient': item.gradient || 'linear-gradient(145deg,#ff4625,#0d0d0d)',
                        '--back-gradient': item.backGradient || `linear-gradient(145deg,#0d0d0d,${item.borderColor || '#ff4625'}22)`,
                        '--proximity': '0',
                    }}
                    onClick={() => onCardClick?.(item, idx)}
                >
                    {renderCardFront
                        ? renderCardFront(item, idx)
                        : null}
                </div>
            ))}
        </div>
    );
}
