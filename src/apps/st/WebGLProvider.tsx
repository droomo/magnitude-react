import React, {useEffect, useState, ReactNode} from 'react';
import * as THREE from 'three';
import WebGLContext from './WebGLContext';
import {webGlConfig} from "./Scene/scene.lib";

interface WebGLProviderProps {
    children: ReactNode;
}

const WebGLProvider: React.FC<WebGLProviderProps> = ({children}) => {
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer>();

    useEffect(() => {
        const newRenderer = new THREE.WebGLRenderer(webGlConfig);

        newRenderer.setSize(window.innerWidth, window.innerHeight);

        setRenderer(newRenderer);

        return () => {
            newRenderer.dispose();
        };
    }, []);

    return (
        <WebGLContext.Provider value={renderer}>{children}</WebGLContext.Provider>
    );
};

export default WebGLProvider;
