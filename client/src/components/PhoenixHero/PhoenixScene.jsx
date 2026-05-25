import { Canvas, useFrame, useThree } from '@react-three/fiber';

function CameraRig({ mouse }) {
    const { camera } = useThree();

    useFrame(() => {
        const targetX = mouse.current.x * 0.6;
        const targetY = mouse.current.y * 0.3;

        camera.position.x += (targetX - camera.position.x) * 0.03;
        camera.position.y += (targetY - camera.position.y) * 0.03;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

export default function PhoenixScene({ mouse }) {
    return (
        <Canvas
            camera={{ position: [0, 0, 8], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{
                antialias: false,
                alpha: false,
                powerPreference: 'high-performance',
            }}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
            }}
        >
            <color attach="background" args={['#050505']} />
            <ambientLight intensity={0.15} />
            <CameraRig mouse={mouse} />
        </Canvas>
    );
}
