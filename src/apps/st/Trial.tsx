import React, {useEffect, useLayoutEffect, useState} from "react";
import {
    API,
    DELAY_INFORM_REACTION_TYPE,
    DELAY_TRIAL_DONE,
    DELAY_TRIAL_START_MASK,
    getCsrfToken,
    page_data,
} from "../const";
import SceneRoom, {TypeTimeStat} from "./Scene/SceneRoom";
import SceneShapeRadius from "./Scene/SceneShapeRadius";
import PageTimeCounter from "./Scene/PageTimeCounter";
import classes from "./css/exp.module.scss";
import axios from "axios";
import PageMask from "./Page/PageMask";

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
    done: (timeStat: TypeTimeStat) => void,
    startedIndex: number
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
        done={(timeStat: TypeTimeStat) => {
            props.done(timeStat)
        }}
        startedIndex={props.startedIndex}
    />
}

function TrialProcess(props: {
    trial: TrialData,
    done: () => void,
    startedIndex: number
}) {
    const [sceneStage, setSceneStage] = useState<boolean>(true);

    useLayoutEffect(() => {
        setSceneStage(true)
    }, [props.trial.id]);

    const sceneDoneAction = (timeStat: TypeTimeStat) => {
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
        <ControlledScene trial={props.trial} done={sceneDoneAction} startedIndex={props.startedIndex}/> :
        <Reaction trial={props.trial} done={props.done}/>
}

const reactionNameMap = {
    'S': '空间',
    'T': '时距',
}

function Reaction(props: {
    trial: TrialData,
    done: () => void
}) {
    const name = reactionNameMap[props.trial.reaction_type as keyof typeof reactionNameMap]
    const [isStagePrepared, setIsStagePrepared] = useState<boolean>(true)

    useEffect(() => {
        setTimeout(() => {
            setIsStagePrepared(false)
        }, DELAY_INFORM_REACTION_TYPE)
    }, []);

    const doneAction = (result: any) => {
        const doneDate = new Date().getTime();
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
    return <>{isStagePrepared && <div className={classes.mask}><PageMask text={`请估计${name}`}/></div>}
        {props.trial.reaction_type === 'S' ?
            <SceneShapeRadius done={doneAction} isStagePrepared={isStagePrepared}/> :
            <PageTimeCounter shouldStart={!isStagePrepared} done={doneAction}/>}
    </>
}


export default function Trial(props: {
    trial: TrialData,
    done: () => void,
    startedIndex: number
}) {
    return (() => {
        switch (props.trial.reaction_type) {
            case 'T':
            case 'S':
                return <TrialProcess {...props}/>
            case 'P':
                return <div>Pause</div>
            case '0':
                return <div>Start</div>
            default:
                return <div>404</div>
        }
    })();
}