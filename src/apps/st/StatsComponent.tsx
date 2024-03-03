import {useEffect, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import Stats from 'stats.js';

const StatsComponent = () => {
    const stats = useRef(new Stats()).current;

    useEffect(() => {
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.dom);

        return () => {
            document.body.removeChild(stats.dom);
        };
    }, [stats]);

    useFrame(() => {
        stats.begin();
        stats.end();
    });

    return null; // 该组件不渲染任何DOM元素
};

export default StatsComponent;