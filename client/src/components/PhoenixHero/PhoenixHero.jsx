import { useRef, useCallback } from 'react';
import PhoenixScene from './PhoenixScene';
import UIOverlay from './UIOverlay';
import Aurora from '../Aurora';
import EmberParticles from '../EmberParticles';
import './PhoenixHero.css';

export default function PhoenixHero() {
    const mouse = useRef({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e) => {
        // Normalize mouse position to -1 ... 1
        mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }, []);

    return (
        <div
            className="phoenix-hero-container"
            id="phoenix-hero-container"
            onMouseMove={handleMouseMove}
        >
            <PhoenixScene mouse={mouse} />
            <Aurora
                colorStops={["#f01d1d","#FFa54d","#f01d1d"]}
                blend={0.64}
                amplitude={1.0}
                speed={0.6}
            />
            <EmberParticles />
            <UIOverlay />
        </div>
    );
}
