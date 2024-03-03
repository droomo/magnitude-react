import React, {useEffect, useMemo, useRef} from 'react';
import classes from './css/timeCounter.module.scss'

import {API} from "../const";

interface TypeTimeCounter {
    stage_start: number,
    stage_occur: number,
    pressed: number,
    page_started: number,
    page_ended: number,
}

const timeCounter: TypeTimeCounter = {
    stage_start: -1,
    stage_occur: -1,
    pressed: -1,
    page_started: -1,
    page_ended: -1
}

const getTimestamp = function () {
    return window.performance.now();
}

function StageIntroduction() {
    return <div className={classes.screen}>
        <div className={classes.descriptionText}>请复现时长</div>
    </div>
}

function StagePreparation() {
    return <div className={classes.screen}>
        <span className={classes.warningText}>准备</span>
    </div>
}

function StageDetection() {
    const [showingCross, setShowingCross] = React.useState(true)
    useEffect(() => {
        timeCounter.stage_occur = getTimestamp()
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                timeCounter.pressed = getTimestamp()
                timeCounter.page_ended = new Date().getTime()
                setShowingCross(false)
                console.log(timeCounter)
                timeCounter.pressed = timeCounter.pressed - timeCounter.stage_occur
                timeCounter.stage_occur = timeCounter.stage_occur - timeCounter.stage_start
                timeCounter.stage_start = timeCounter.stage_start - timeCounter.stage_start
                console.log(timeCounter)
            }
        })
    }, []);
    return <div className={classes.screen}>
        {showingCross ?
            <span className={classes.crossText}>+</span> :
            <span className={classes.warningText}>完成</span>}
    </div>
}

const stageMap = [StageIntroduction, StagePreparation, StageDetection]
export default function TimeCounter(props: any) {

    const [stage, setStage] = React.useState(0)

    if (timeCounter.page_started === -1) {
        timeCounter.page_started = new Date().getTime()
    }

    useEffect(() => {
        if (stage + 1 < stageMap.length) {
            setTimeout(() => {
                setStage(stage + 1)
                timeCounter.stage_start = getTimestamp()
            }, 1000 - 1000 / 59)
        }
    }, [stage]);

    return (
        <div className={classes.timeCounter}>
            {(() => {
                const Stage = stageMap[stage]
                return <Stage/>
            })()}
        </div>
    );
}
