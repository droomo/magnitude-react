import React, {useEffect, useLayoutEffect, useMemo, useState} from "react";
import {Route, Routes} from "react-router-dom";
import {getTimestamp} from "../const";
import Scene, {TypeTimeStat} from "./Scene/SceneRoom";
import SceneShapeRadius from "./Scene/SceneShapeRadius";

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

function ControlledScene(props: {
    trial: TrialData,
    done: (timeStat: TypeTimeStat) => void
}) {
    return <Scene
        room={{
            depth: props.trial.room_depth!,
            height: props.trial.room_height!,
            width: props.trial.room_width!,
            ground: props.trial.room_ground!,
            wall: props.trial.room_wall!,
            duration: props.trial.room_duration!,
        }}
        done={(timeStat: TypeTimeStat) => {
            props.done(timeStat)
        }}
    />
}

function TrialProcess(props: {
    trial: TrialData,
    done: () => void
}) {
    const [sceneStage, setSceneStage] = useState<boolean>(true);

    return sceneStage ? <ControlledScene
        trial={props.trial}
        done={(timeStat: TypeTimeStat) => {
            console.log(timeStat)
            setSceneStage(false)
        }}
    /> : <SceneShapeRadius/>
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
                return <TrialProcess trial={props.trial} done={props.done}/>
            case 'P':
                return <div>Pause</div>
            case '0':
                return <div>Start</div>
            default:
                return <div>404</div>
        }
    })();
}