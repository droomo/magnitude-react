import React, {useEffect, useLayoutEffect, useMemo, useRef} from "react";
import {Route, Routes} from "react-router-dom";
import {getTimestamp} from "../const";
import Scene from "./Scene/SceneRoom";

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

interface ComponentTimeStat {
    mount: number,
    unmount: number,
    renderStart: number
    renderDone: number
}

function ControlledScene(props: {
    trial: TrialData,
    done: () => void
}) {

    console.log(props.trial.room_duration!)
    setTimeout(() => {
        console.log(props.trial.room_duration!)
        props.done()
        console.log(props.trial.room_duration!)
    }, (props.trial.room_duration!) * 1000)

    return <Scene
        depth={props.trial.room_depth!}
        height={props.trial.room_height!}
        width={props.trial.room_width!}
        ground={props.trial.room_ground!}
        wall={props.trial.room_wall!}
        duration={props.trial.room_duration!}
    />
}

function TrialSpace(props: {
    trial: TrialData,
    done: () => void
}) {
    return <ControlledScene
        trial={props.trial}
        done={props.done}
    />
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
                return <TrialSpace trial={props.trial} done={props.done}/>
            case 'P':
                return <div>Pause</div>
            case '0':
                return <div>Start</div>
            default:
                return <div>404</div>
        }
    })();
}