import { useEffect, useRef } from 'react';

const EMBER_COUNT = 30;

export default function EmberParticles() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        for (let i = 0; i < EMBER_COUNT; i++) {
            const ember = document.createElement('div');
            ember.classList.add('ember');
            const size = 2 + Math.random() * 4;
            const left = Math.random() * 100;
            const duration = 6 + Math.random() * 10;
            const delay = Math.random() * 12;
            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;
            ember.style.left = `${left}%`;
            ember.style.bottom = `-${size}px`;
            ember.style.animationDuration = `${duration}s`;
            ember.style.animationDelay = `${delay}s`;
            container.appendChild(ember);
        }

        return () => {
            container.innerHTML = '';
        };
    }, []);

    return <div className="ember-container" ref={containerRef}></div>;
}
