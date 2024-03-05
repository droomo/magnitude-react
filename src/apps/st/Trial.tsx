import React, {useEffect, useMemo} from "react";
import {Route, Routes} from "react-router-dom";

export interface TrialData {
    reaction_type: string
    done?: boolean
    id?: number
    room_depth?: number
    room_duration?: number
    room_ground?: number
    room_height?: number
    room_wall?: number
    room_width?: number
}

export default function Trial(props: {
    trial: TrialData,
    done: () => void
}) {
    console.log(props.trial)
    return (() => {
        switch (props.trial.reaction_type) {
            case 'T':
                return <div>Time</div>
            case 'S':
                return <div>Space</div>
            case 'P':
                return <div>Pause</div>
            case '0':
                return <div>Start</div>
            default:
                return <div>404</div>
        }
    })();
}