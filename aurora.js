/**
 * Aurora Background Effect
 * A WebGL-powered flowing gradient wave animation.
 * Ported from the React Aurora component to vanilla JS.
 *
 * Usage:
 *   initAurora('#aurora-canvas', {
 *     colorStops: ['#f01d1d', '#f0ca12', '#F97316'],
 *     blend: 0.64,
 *     amplitude: 1.0,
 *     speed: 0.6
 *   });
 */
(function () {
    'use strict';

    // ─── Vertex Shader ───
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // ─── Fragment Shader ───
    const fragmentShaderSource = `
        precision mediump float;

        uniform float u_time;
        uniform vec2  u_resolution;
        uniform vec3  u_colors[3];
        uniform float u_blend;
        uniform float u_amplitude;
        uniform float u_speed;

        // Simplex-style noise helpers
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

        float snoise(vec2 v) {
            const vec4 C = vec4(
                0.211324865405187,   // (3.0-sqrt(3.0))/6.0
                0.366025403784439,   //  0.5*(sqrt(3.0)-1.0)
               -0.577350269189626,   // -1.0 + 2.0 * C.x
                0.024390243902439    //  1.0 / 41.0
            );
            vec2 i  = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
            m = m * m;
            m = m * m;
            vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
            vec3 h  = abs(x_) - 0.5;
            vec3 ox = floor(x_ + 0.5);
            vec3 a0 = x_ - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / u_resolution;
            float t = u_time * u_speed;

            // Generate layered noise for flowing waves
            float n1 = snoise(vec2(uv.x * 1.4 + t * 0.3, uv.y * 1.2 - t * 0.15)) * u_amplitude;
            float n2 = snoise(vec2(uv.x * 2.2 - t * 0.2, uv.y * 1.8 + t * 0.25)) * u_amplitude;
            float n3 = snoise(vec2(uv.x * 0.8 + t * 0.15, uv.y * 2.5 - t * 0.1)) * u_amplitude;

            // Create wave bands
            float wave1 = smoothstep(0.0, u_blend, 0.5 + n1 * 0.5 - abs(uv.y - 0.35 - n3 * 0.15));
            float wave2 = smoothstep(0.0, u_blend, 0.5 + n2 * 0.5 - abs(uv.y - 0.55 + n1 * 0.12));
            float wave3 = smoothstep(0.0, u_blend, 0.5 + n3 * 0.5 - abs(uv.y - 0.7 - n2 * 0.1));

            // Blend colors
            vec3 col = vec3(0.0);
            col = mix(col, u_colors[0], wave1 * 0.7);
            col = mix(col, u_colors[1], wave2 * 0.6);
            col = mix(col, u_colors[2], wave3 * 0.65);

            // Add subtle global glow
            float glow = snoise(vec2(uv.x * 0.6 + t * 0.08, uv.y * 0.5)) * 0.5 + 0.5;
            col += mix(u_colors[0], u_colors[2], uv.x) * glow * 0.06;

            // Vignette for smooth edges
            float vig = smoothstep(0.0, 0.5, uv.x) * smoothstep(1.0, 0.5, uv.x);
            vig *= smoothstep(0.0, 0.35, uv.y) * smoothstep(1.0, 0.6, uv.y);
            col *= vig;

            // Overall opacity
            float alpha = max(max(wave1, wave2), wave3) * 0.55 * vig;

            gl_FragColor = vec4(col, alpha);
        }
    `;

    function hexToVec3(hex) {
        hex = hex.replace('#', '');
        return [
            parseInt(hex.substring(0, 2), 16) / 255,
            parseInt(hex.substring(2, 4), 16) / 255,
            parseInt(hex.substring(4, 6), 16) / 255
        ];
    }

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Aurora shader error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vs, fs) {
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Aurora program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    /**
     * Initialize the Aurora effect on a canvas element.
     * @param {string} selector - CSS selector for the canvas element.
     * @param {Object} opts
     * @param {string[]} opts.colorStops - Array of 3 hex color strings.
     * @param {number}   opts.blend     - Blend smoothness (0-1).
     * @param {number}   opts.amplitude - Wave amplitude.
     * @param {number}   opts.speed     - Animation speed.
     */
    function initAurora(selector, opts) {
        const canvas = document.querySelector(selector);
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
        if (!gl) {
            console.warn('Aurora: WebGL not supported, falling back to CSS.');
            canvas.style.background = 'radial-gradient(ellipse at center, rgba(240,29,29,0.08) 0%, transparent 60%)';
            return;
        }

        // Compile shaders & link program
        const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
        if (!vs || !fs) return;
        const program = createProgram(gl, vs, fs);
        if (!program) return;

        // Fullscreen quad
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,  1, -1,  -1, 1,
            -1,  1,  1, -1,   1, 1
        ]), gl.STATIC_DRAW);

        const aPos = gl.getAttribLocation(program, 'a_position');

        // Uniform locations
        const uTime       = gl.getUniformLocation(program, 'u_time');
        const uResolution = gl.getUniformLocation(program, 'u_resolution');
        const uBlend      = gl.getUniformLocation(program, 'u_blend');
        const uAmplitude  = gl.getUniformLocation(program, 'u_amplitude');
        const uSpeed      = gl.getUniformLocation(program, 'u_speed');

        const colorUniforms = [];
        for (let i = 0; i < 3; i++) {
            colorUniforms.push(gl.getUniformLocation(program, `u_colors[${i}]`));
        }

        // Parse colors
        const colors = (opts.colorStops || ['#f01d1d', '#f0ca12', '#F97316']).map(hexToVec3);

        // Resize handler
        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            canvas.width  = rect.width  * dpr;
            canvas.height = rect.height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }

        resize();
        window.addEventListener('resize', resize);

        // Enable blending for transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        // Animation loop
        let animId;
        const startTime = performance.now();

        function render() {
            const elapsed = (performance.now() - startTime) / 1000;

            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.useProgram(program);

            gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
            gl.enableVertexAttribArray(aPos);
            gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

            gl.uniform1f(uTime, elapsed);
            gl.uniform2f(uResolution, canvas.width, canvas.height);
            gl.uniform1f(uBlend, opts.blend ?? 0.64);
            gl.uniform1f(uAmplitude, opts.amplitude ?? 1.0);
            gl.uniform1f(uSpeed, opts.speed ?? 0.6);

            for (let i = 0; i < 3; i++) {
                gl.uniform3fv(colorUniforms[i], colors[i]);
            }

            gl.drawArrays(gl.TRIANGLES, 0, 6);

            animId = requestAnimationFrame(render);
        }

        render();

        // Pause when tab is hidden for performance
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                cancelAnimationFrame(animId);
            } else {
                render();
            }
        });
    }

    // Expose globally
    window.initAurora = initAurora;
})();
