import { useRef, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 4000;
const EMBER_COUNT = 600;

// Fiery color palette
const COLOR_FIRE_ORANGE = new THREE.Color('#FF5722');
const COLOR_GOLD = new THREE.Color('#FFC107');
const COLOR_CRIMSON = new THREE.Color('#900C3F');
const COLOR_EMBER_BRIGHT = new THREE.Color('#FF8A65');
const COLOR_EMBER_DIM = new THREE.Color('#BF360C');

function generateWingPositions() {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);

    const tempColor = new THREE.Color();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;

        // Parametric wing shape
        const t = Math.random() * Math.PI * 2;
        const side = Math.random() > 0.5 ? 1 : -1;

        // Wing span: wider at the top, narrow at the center
        const wingSpread = Math.pow(Math.random(), 0.6) * 6;
        const wingHeight = (Math.sin(t) * 0.5 + Math.cos(t * 0.7) * 0.3) * 3;
        const wingDepth = Math.sin(t * 2) * 0.8 + (Math.random() - 0.5) * 0.6;

        // Curvature — wings sweep backward
        const curveFactor = Math.pow(wingSpread / 6, 1.5) * 1.2;

        positions[i3] = side * wingSpread + (Math.random() - 0.5) * 0.4;
        positions[i3 + 1] = wingHeight + (Math.random() - 0.5) * 1.5;
        positions[i3 + 2] = wingDepth - curveFactor;

        // Color based on position
        const distFromCenter = wingSpread / 6;
        if (distFromCenter < 0.3) {
            tempColor.copy(COLOR_GOLD);
        } else if (distFromCenter < 0.6) {
            tempColor.lerpColors(COLOR_GOLD, COLOR_FIRE_ORANGE, (distFromCenter - 0.3) / 0.3);
        } else {
            tempColor.lerpColors(COLOR_FIRE_ORANGE, COLOR_CRIMSON, (distFromCenter - 0.6) / 0.4);
        }

        // Add some random variation
        tempColor.r += (Math.random() - 0.5) * 0.1;
        tempColor.g += (Math.random() - 0.5) * 0.05;

        colors[i3] = tempColor.r;
        colors[i3 + 1] = tempColor.g;
        colors[i3 + 2] = tempColor.b;

        // Particle size — smaller at the tips, bigger at the core
        sizes[i] = (1 - distFromCenter * 0.7) * (0.8 + Math.random() * 0.6);

        // Animation parameters
        speeds[i] = 0.3 + Math.random() * 0.7;
        phases[i] = Math.random() * Math.PI * 2;
    }

    return { positions, colors, sizes, speeds, phases };
}

function generateEmberPositions() {
    const positions = new Float32Array(EMBER_COUNT * 3);
    const colors = new Float32Array(EMBER_COUNT * 3);
    const sizes = new Float32Array(EMBER_COUNT);
    const velocities = new Float32Array(EMBER_COUNT * 3);

    const tempColor = new THREE.Color();

    for (let i = 0; i < EMBER_COUNT; i++) {
        const i3 = i * 3;

        // Embers spread around the wings
        positions[i3] = (Math.random() - 0.5) * 14;
        positions[i3 + 1] = (Math.random() - 0.5) * 8 - 1;
        positions[i3 + 2] = (Math.random() - 0.5) * 4;

        // Upward drift with slight sideways
        velocities[i3] = (Math.random() - 0.5) * 0.3;
        velocities[i3 + 1] = 0.5 + Math.random() * 1.5;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;

        // Color — bright orange to dim red
        tempColor.lerpColors(COLOR_EMBER_DIM, COLOR_EMBER_BRIGHT, Math.random());
        colors[i3] = tempColor.r;
        colors[i3 + 1] = tempColor.g;
        colors[i3 + 2] = tempColor.b;

        sizes[i] = 0.3 + Math.random() * 0.5;
    }

    return { positions, colors, sizes, velocities };
}

export default function PhoenixParticles({ mouse }) {
    const wingRef = useRef();
    const emberRef = useRef();
    const { viewport } = useThree();

    const wingData = useMemo(() => generateWingPositions(), []);
    const emberData = useMemo(() => generateEmberPositions(), []);

    // Store initial wing positions for reference
    const initialPositions = useMemo(
        () => new Float32Array(wingData.positions),
        [wingData.positions]
    );

    useFrame((state) => {
        const time = state.clock.elapsedTime;

        // --- Wing animation ---
        if (wingRef.current) {
            const posAttr = wingRef.current.geometry.attributes.position;
            const sizeAttr = wingRef.current.geometry.attributes.size;
            const arr = posAttr.array;

            // Mouse influence in world coordinates
            const mx = (mouse.current.x * viewport.width) / 2;
            const my = (mouse.current.y * viewport.height) / 2;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const i3 = i * 3;
                const speed = wingData.speeds[i];
                const phase = wingData.phases[i];
                const ix = initialPositions[i3];
                const iy = initialPositions[i3 + 1];
                const iz = initialPositions[i3 + 2];

                // Breathing / flapping motion
                const breathe = Math.sin(time * 0.8 + phase) * 0.15;
                const flap = Math.sin(time * 1.2 + Math.abs(ix) * 0.3) * 0.3 * (Math.abs(ix) / 6);
                const wave = Math.cos(time * 0.5 + iy * 0.5) * 0.08;

                // Rising ash effect
                const rise = Math.sin(time * 0.3 * speed + phase) * 0.12;

                arr[i3] = ix + wave;
                arr[i3 + 1] = iy + flap + breathe + rise;
                arr[i3 + 2] = iz + Math.sin(time * 0.6 + phase) * 0.1;

                // Mouse repulsion
                const dx = arr[i3] - mx;
                const dy = arr[i3 + 1] - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const repulseRadius = 2.5;

                if (dist < repulseRadius) {
                    const force = (1 - dist / repulseRadius) * 0.8;
                    arr[i3] += (dx / dist) * force;
                    arr[i3 + 1] += (dy / dist) * force;
                }

                // Pulsing size near cursor
                const baseSz = wingData.sizes[i];
                if (dist < repulseRadius * 1.5) {
                    const glow = (1 - dist / (repulseRadius * 1.5)) * 0.6;
                    sizeAttr.array[i] = baseSz * (1 + glow);
                } else {
                    sizeAttr.array[i] = baseSz * (1 + Math.sin(time * 2 + phase) * 0.05);
                }
            }

            posAttr.needsUpdate = true;
            sizeAttr.needsUpdate = true;
        }

        // --- Ember animation ---
        if (emberRef.current) {
            const posAttr = emberRef.current.geometry.attributes.position;
            const sizeAttr = emberRef.current.geometry.attributes.size;
            const arr = posAttr.array;

            for (let i = 0; i < EMBER_COUNT; i++) {
                const i3 = i * 3;
                const vy = emberData.velocities[i3 + 1];

                // Rise upward
                arr[i3 + 1] += vy * 0.008;
                arr[i3] += Math.sin(time * 0.5 + i) * 0.003;
                arr[i3 + 2] += Math.cos(time * 0.3 + i * 0.5) * 0.002;

                // Reset when too high
                if (arr[i3 + 1] > 6) {
                    arr[i3 + 1] = -4 - Math.random() * 2;
                    arr[i3] = (Math.random() - 0.5) * 14;
                    arr[i3 + 2] = (Math.random() - 0.5) * 4;
                }

                // Flicker size
                sizeAttr.array[i] =
                    emberData.sizes[i] * (0.5 + Math.sin(time * 3 + i * 7) * 0.5);
            }

            posAttr.needsUpdate = true;
            sizeAttr.needsUpdate = true;
        }
    });

    // Custom point texture for softer particles
    const pointTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
        gradient.addColorStop(0.7, 'rgba(255,255,255,0.1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(canvas);
        return tex;
    }, []);

    return (
        <>
            {/* Main wing particles */}
            <points ref={wingRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={PARTICLE_COUNT}
                        array={wingData.positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={PARTICLE_COUNT}
                        array={wingData.colors}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-size"
                        count={PARTICLE_COUNT}
                        array={wingData.sizes}
                        itemSize={1}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.12}
                    vertexColors
                    transparent
                    opacity={0.9}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    map={pointTexture}
                    sizeAttenuation
                />
            </points>

            {/* Floating embers */}
            <points ref={emberRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={EMBER_COUNT}
                        array={emberData.positions}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        count={EMBER_COUNT}
                        array={emberData.colors}
                        itemSize={3}
                    />
                    <bufferAttribute
                        attach="attributes-size"
                        count={EMBER_COUNT}
                        array={emberData.sizes}
                        itemSize={1}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.06}
                    vertexColors
                    transparent
                    opacity={0.7}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                    map={pointTexture}
                    sizeAttenuation
                />
            </points>
        </>
    );
}
