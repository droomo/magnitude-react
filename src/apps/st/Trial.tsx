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
import axios from "axios";

export interface TrialData {
    reaction_type: string
    done?: boolean
    id?: number
    depth?: number
    height?: number
    width?: number
    duration?: number
}

function ControlledScene(props: {
    trial: TrialData,
    done: (timeStat: TypeRoomStat) => void,
}) {
    return <SceneRoom
        room={{
            depth: props.trial.depth!,
            height: props.trial.height!,
            width: props.trial.width!,
            duration: props.trial.duration!,
        }}
        done={(timeStat: TypeRoomStat) => {
            props.done(timeStat)
        }}
    />
}

export default function Trial(props: {
    trial: TrialData,
    done: () => void,
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
        axios.post(`${API.base_url}${page_data['api_trial']}`, {
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
            <ControlledScene trial={props.trial} done={sceneDoneAction}/>
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
        const doneDate = new Date().getTime();
        axios.post(`${API.base_url}${page_data['api_trial']}`, {
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
                setTimeout(() => {
                    props.done()
                }, DELAY_TRIAL_DONE - new Date().getTime() + doneDate - DELAY_TRIAL_START_MASK)
            } else {
                alert('error happened 33')
            }
        }).catch(() => {
            alert('error happened 44')
        })
    }
    return <SceneShapeRadius done={doneAction}/>
}
