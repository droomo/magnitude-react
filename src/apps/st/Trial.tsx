import React, {useLayoutEffect, useState} from "react";
import {
    API,
    DELAY_TRIAL_DONE,
    DELAY_TRIAL_START_MASK,
    getCsrfToken,
    page_data,
} from "../const";
import SceneRoom, {TypeRoomStat} from "./Scene/SceneRoom";
import SceneShapeRadius from "./Scene/SceneShapeRadius";
import PageTimeCounter from "./Scene/PageTimeCounter";
import axios from "axios";

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
    done: (timeStat: TypeRoomStat) => void,
    startedIndex: number,
}) {
    return <SceneRoom
        room={{
            depth: props.trial.room_depth!,
            height: props.trial.room_height!,
            width: props.trial.room_width!,
            ground: props.trial.room_ground!,
            wall: props.trial.room_wall!,
            duration: props.trial.room_duration!,
        }}
        done={(timeStat: TypeRoomStat) => {
            props.done(timeStat)
        }}
        startedIndex={props.startedIndex}
    />
}

export default function Trial(props: {
    trial: TrialData,
    done: () => void,
    startedIndex: number,
    helperText?: {
        scene?: React.ReactElement,
        reaction?: React.ReactElement,
    }
}) {
    const [sceneStage, setSceneStage] = useState<boolean>(true);

    useLayoutEffect(() => {
        setSceneStage(true)
    }, [props.trial.id]);

    const sceneDoneAction = (timeStat: TypeRoomStat) => {
        setSceneStage(false)
        axios.post(`${API.base_url}${page_data['api_trial_stat']}`, {
            stat_scene: timeStat,
            id: props.trial.id,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        }).then(response => {
            if (response.data.status !== 200) {
                alert('error happened 11')
            }
        }).catch(() => {
            alert('error happened 22')
        })
    }
    return sceneStage ?
        <>
            {props.helperText && props.helperText.scene && props.helperText.scene}
            <ControlledScene trial={props.trial} done={sceneDoneAction} startedIndex={props.startedIndex}/>
        </> :
        <>
            {props.helperText && props.helperText.reaction && props.helperText.reaction}
            <Reaction trial={props.trial} done={props.done}/>
        </>
}

function Reaction(props: {
    trial: TrialData,
    done: () => void
}) {
    const doneAction = (result: any) => {
        // const doneDate = new Date().getTime();
        axios.post(`${API.base_url}${page_data['api_trial_stat']}`, {
            stat_reaction: result,
            id: props.trial.id,
            done: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        }).then(response => {
            if (response.data.status === 200) {
                props.done()
            } else {
                alert('error happened 33')
            }
        }).catch(() => {
            alert('error happened 44')
        })
    }
    return props.trial.reaction_type === 'S' ?
        <SceneShapeRadius done={doneAction}/> :
        <PageTimeCounter done={doneAction}/>
}
