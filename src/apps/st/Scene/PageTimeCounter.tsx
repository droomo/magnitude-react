import React, {useLayoutEffect, useRef, useState} from 'react';
import classes from '../css/exp.module.scss'

import {getTimestamp} from "../../const";
import PageMask from "../Page/PageMask";

export interface TypeTimeCounter {
    prep_disappear_date: number
    cross_stage_start_date: number
    pressed_date: number
    cross_stage_start: number
    cross_appear_fss: number // from stage start
    pressed_fss: number
}

function StagePreparation() {
    return <PageMask text={<span className={classes.warningText}>准备</span>}/>
}

function StageDetection(props: {
    done: (timeCounter: TypeTimeCounter) => void,
    timeCounter: TypeTimeCounter
}) {
    const [showingCross, setShowingCross] = React.useState(true)

    props.timeCounter.cross_stage_start = getTimestamp()
    props.timeCounter.cross_stage_start_date = new Date().getTime()
    useLayoutEffect(() => {
        const onMousedownDown = (e: MouseEvent) => {
            if (e.button === 0) {
                props.timeCounter.pressed_fss = getTimestamp() - props.timeCounter.cross_stage_start
                props.timeCounter.pressed_date = new Date().getTime()
                setShowingCross(false)
                props.timeCounter.cross_stage_start = props.timeCounter.cross_stage_start - props.timeCounter.cross_stage_start
                props.done(props.timeCounter)
            }
        }

        props.timeCounter.cross_appear_fss = getTimestamp() - props.timeCounter.cross_stage_start;
        window.addEventListener('mousedown', onMousedownDown)
        return () => {
            window.removeEventListener('mousedown', onMousedownDown)
        }
    }, [props]);
    return <PageMask text={showingCross ? <span className={classes.crossText}>+</span> : '完成'}/>
}

export default function PageTimeCounter(props: {
    done: (timeCounter: TypeTimeCounter) => void,
    shouldStart: boolean
}) {
    const timeCounter = useRef<TypeTimeCounter>({
        prep_disappear_date: -1,
        cross_stage_start_date: -1,
        pressed_date: -1,
        cross_stage_start: -1,
        cross_appear_fss: -1,
        pressed_fss: -1,
    }).current

    const [showingPreparation, setShowingPreparation] = React.useState(true)
    const [done, setDone] = useState(false);

    useLayoutEffect(() => {
        if (props.shouldStart) {
            setTimeout(() => {
                timeCounter.prep_disappear_date = new Date().getTime()
                setShowingPreparation(false)
            }, 1000)
        }
    }, [props.shouldStart]);

    return done ? <PageMask/> : <div className={classes.timeCounter}>
        {showingPreparation ? <StagePreparation/> : <StageDetection
            done={() => {
                setDone(true)
                props.done(timeCounter)
            }}
            timeCounter={timeCounter}
        />}
    </div>;
}
