import React from 'react';

export function HelperText(props: any) {
    return <div style={{
        position: 'absolute', fontSize: '2rem', color: 'white',
        top: '2rem', left: '2rem'
    }}>{props.children}</div>
}