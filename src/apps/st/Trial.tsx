import React, {ReactElement, useEffect, useLayoutEffect, useMemo, useState} from "react";
import {Route, Routes} from "react-router-dom";
import {API, getCsrfToken, getTimestamp, page_data} from "../const";
import Scene, {TypeTimeStat} from "./Scene/SceneRoom";
import SceneShapeRadius, {TypeSceneShapeResult} from "./Scene/SceneShapeRadius";
import classes from "./css/timeCounter.module.scss";
import TimeCounter, {TypeTimeCounter} from "./Scene/TimeCounter";
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
    console.log(props.trial.id)
    const [sceneStage, setSceneStage] = useState<boolean>(true);

    useEffect(() => {
        setSceneStage(true)
    }, [props.trial]);

    return sceneStage ? <ControlledScene
        trial={props.trial}
        done={(timeStat: TypeTimeStat) => {
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
            setSceneStage(false)
        }}
    /> : <Reaction
        trial={props.trial}
        done={props.done}
    />
}

const reactionNameMap = {
    'S': '空间',
    'T': '时距',
}
const measureComponentMap = {
    'S': SceneShapeRadius,
    'T': TimeCounter,
}

function Reaction(props: {
    trial: TrialData,
    done: () => void
}) {
    const name = reactionNameMap[props.trial.reaction_type as keyof typeof reactionNameMap]
    const MeasureComponent = measureComponentMap[props.trial.reaction_type as keyof typeof measureComponentMap]
    const [onStagePrepared, setOnStagePrepared] = useState(true)

    useEffect(() => {
        setTimeout(() => {
            setOnStagePrepared(false)
        }, 1000)
    }, [onStagePrepared]);

    return (
        onStagePrepared ? <StageIntroduction name={name}></StageIntroduction> :
            <MeasureComponent done={(result: TypeSceneShapeResult | TypeTimeCounter) => {
                axios.post(`${API.base_url}${page_data['api_trial_stat']}`, {
                    stat_reaction: result,
                    id: props.trial.id,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                    },
                }).then(response => {
                    if (response.data.status !== 200) {
                        alert('error happened 33')
                    }
                }).catch(() => {
                    alert('error happened 44')
                })
                props.done()
            }}/>
    );
}

function StageIntroduction(props: {
    name: string
}) {
    return <div className={classes.screen}>
        <div className={classes.descriptionText}>请估计{props.name}</div>
    </div>
}

export default function Trial(props: {
    trial: TrialData,
    done: () => void
}) {
    console.log(props.trial)
    return (() => {
        switch (props.trial.reaction_type) {
            case 'T':
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