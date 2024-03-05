import React from 'react';
import * as THREE from 'three';

const WebGLContext = React.createContext<THREE.WebGLRenderer | undefined>(undefined);

export default WebGLContext;
