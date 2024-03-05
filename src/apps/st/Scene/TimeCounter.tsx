import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import classes from '../css/timeCounter.module.scss'

import {getTimestamp} from "../../const";

export interface TypeTimeCounter {
    page_started_date: number
    stage_start_date: number
    page_ended_date: number
    stage_start: number
    stage_occur_fss: number // from stage start
    pressed_fss: number
}

const timeCounter: TypeTimeCounter = {
    page_started_date: -1,
    stage_start_date: -1,
    page_ended_date: -1,
    stage_start: -1,
    stage_occur_fss: -1,
    pressed_fss: -1,
}

function StagePreparation() {
    return <div className={classes.screen}>
        <span className={classes.warningText}>准备</span>
    </div>
}

function StageDetection(props: {
    done: (timeCounter: TypeTimeCounter) => void
}) {
    const [showingCross, setShowingCross] = React.useState(true)
    timeCounter.stage_start = getTimestamp()
    timeCounter.stage_start_date = new Date().getTime()
    useLayoutEffect(() => {
        timeCounter.stage_occur_fss = getTimestamp() - timeCounter.stage_start;
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                timeCounter.pressed_fss = getTimestamp() - timeCounter.stage_start
                setShowingCross(false)
                timeCounter.stage_start = timeCounter.stage_start - timeCounter.stage_start
                props.done(timeCounter)
            }
        })
        return () => {
            timeCounter.page_ended_date = new Date().getTime()
        }
    }, []);
    return <div className={classes.screen}>
        {showingCross ?
            <span className={classes.crossText}>+</span> :
            <span className={classes.warningText}>完成</span>}
    </div>
}

export default function TimeCounter(props: {
    done: (timeCounter: TypeTimeCounter) => void
}) {
    timeCounter.page_started_date = new Date().getTime()

    const [showingPreparation, setShowingPreparation] = React.useState(true)

    useEffect(() => {
        setTimeout(() => {
            setShowingPreparation(false)
        }, 1000)
    }, []);

    return (
        <div className={classes.timeCounter}>
            {showingPreparation ? <StagePreparation/> : <StageDetection done={props.done}/>}
        </div>
    );
}
