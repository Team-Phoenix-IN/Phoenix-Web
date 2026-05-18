import { useRef, useEffect, useId } from 'react';

export default function ReflectiveCard({
    overlayColor = 'rgba(0, 0, 0, 0.2)',
    blurStrength = 12,
    glassDistortion = 30,
    metalness = 1,
    roughness = 0.75,
    displacementStrength = 20,
    noiseScale = 1,
    specularConstant = 5,
    grayscale = 0.15,
    color = '#ffffff',
    children,
    className = '',
    style = {},
}) {
    const cardRef = useRef(null);
    const uniqueId = useId().replace(/:/g, '');
    const filterId = `reflective-filter-${uniqueId}`;
    const dispMapId = `disp-map-${uniqueId}`;

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);

            // Subtle 3D tilt
            const rotateX = ((y - 50) / 50) * -4;
            const rotateY = ((x - 50) / 50) * 4;
            card.style.setProperty('--tilt-x', `${rotateX}deg`);
            card.style.setProperty('--tilt-y', `${rotateY}deg`);
        };

        const handleMouseLeave = () => {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
        };

        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            card.removeEventListener('mousemove', handleMouseMove);
            card.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const specExp = Math.max(1, Math.round((1 - roughness) * 40));
    const surfaceScale = metalness * 3;

    return (
        <div
            ref={cardRef}
            className={`reflective-card ${className}`}
            style={{
                '--overlay-color': overlayColor,
                '--blur-strength': `${blurStrength}px`,
                '--grayscale': grayscale,
                '--card-color': color,
                ...style,
            }}
        >
            {/* SVG Filters */}
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    {/* Displacement Map */}
                    <radialGradient id={dispMapId}>
                        <stop offset="0%" stopColor="white" />
                        <stop offset="100%" stopColor="black" />
                    </radialGradient>

                    <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
                        {/* Turbulence for glass distortion */}
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency={`${0.01 * noiseScale} ${0.015 * noiseScale}`}
                            numOctaves="3"
                            seed="2"
                            result="noise"
                        />

                        {/* Glass displacement */}
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={glassDistortion}
                            xChannelSelector="R"
                            yChannelSelector="G"
                            result="displaced"
                        />

                        {/* Blur the displaced image */}
                        <feGaussianBlur
                            in="displaced"
                            stdDeviation={displacementStrength * 0.15}
                            result="blurred"
                        />

                        {/* Specular lighting for metallic highlights */}
                        <feSpecularLighting
                            in="noise"
                            surfaceScale={surfaceScale}
                            specularConstant={specularConstant}
                            specularExponent={specExp}
                            lightingColor={color}
                            result="specular"
                        >
                            <fePointLight x="200" y="100" z="200" />
                        </feSpecularLighting>

                        <feComposite
                            in="specular"
                            in2="SourceAlpha"
                            operator="in"
                            result="specClipped"
                        />

                        {/* Merge everything */}
                        <feMerge>
                            <feMergeNode in="blurred" />
                            <feMergeNode in="specClipped" />
                        </feMerge>
                    </filter>
                </defs>
            </svg>

            {/* Glass layer */}
            <div className="reflective-card-glass" style={{ filter: `url(#${filterId})` }} />

            {/* Overlay tint */}
            <div className="reflective-card-overlay" />

            {/* Specular shine that follows mouse */}
            <div className="reflective-card-shine" />

            {/* Edge highlight */}
            <div className="reflective-card-edge" />

            {/* Content */}
            <div className="reflective-card-content">
                {children}
            </div>
        </div>
    );
}
