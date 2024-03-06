import React, {useEffect, useMemo, useState} from 'react';
import classes from '../css/timeCounter.module.scss'

import {getTimestamp} from "../../const";
import PageMask from "../Page/PageMask";

export interface TypeTimeCounter {
    page_started_date: number
    stage_start_date: number
    page_ended_date: number
    pressed_date: number
    stage_start: number
    stage_occur_fss: number // from stage start
    pressed_fss: number
}

function StagePreparation() {
    return <div className={classes.screen}>
        <span className={classes.warningText}>准备</span>
    </div>
}

function StageDetection(props: {
    done: (timeCounter: TypeTimeCounter) => void,
    timeCounter: TypeTimeCounter
}) {
    const [showingCross, setShowingCross] = React.useState(true)

    const onMousedownDown = (e: MouseEvent) => {
        if (e.button === 0) {
            props.timeCounter.pressed_fss = getTimestamp() - props.timeCounter.stage_start
            props.timeCounter.pressed_date = new Date().getTime()
            setShowingCross(false)
            props.timeCounter.stage_start = props.timeCounter.stage_start - props.timeCounter.stage_start
            props.done(props.timeCounter)
        }
    }
    props.timeCounter.stage_start = getTimestamp()
    props.timeCounter.stage_start_date = new Date().getTime()
    useEffect(() => {
        props.timeCounter.stage_occur_fss = getTimestamp() - props.timeCounter.stage_start;
        window.addEventListener('mousedown', onMousedownDown)
        return () => {
            window.removeEventListener('mousedown', onMousedownDown)
        }
    }, [onMousedownDown, props.timeCounter]);
    return <div className={classes.screen}>
        {showingCross ?
            <span className={classes.crossText}>+</span> :
            <span className={classes.warningText}>完成</span>}
    </div>
}

export default function TimeCounter(props: {
    done: (timeCounter: TypeTimeCounter) => void,
    start: boolean
}) {
    const timeCounter: TypeTimeCounter = useMemo(() => {
        return {
            page_started_date: -1,
            stage_start_date: -1,
            page_ended_date: -1,
            pressed_date: -1,
            stage_start: -1,
            stage_occur_fss: -1,
            pressed_fss: -1,
        }
    }, [])
    timeCounter.page_started_date = new Date().getTime()

    const [showingPreparation, setShowingPreparation] = React.useState(true)
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (props.start) {
            setTimeout(() => {
                setShowingPreparation(false)
            }, 1000)
        }
    }, [props.start]);

    return done ? <PageMask/> : <div className={classes.timeCounter}>
        {showingPreparation ? <StagePreparation/> : <StageDetection
            done={() => {
                setDone(true)
                timeCounter.page_ended_date = new Date().getTime()
                props.done(timeCounter)
            }}
            timeCounter={timeCounter}
        />}
    </div>;
}
