import React, {useEffect} from "react";
import Trial, {TrialData} from "./Trial";
import classes from "./css/exp.module.scss";
import axios from "axios";
import {API, DEBUG, page_data} from "../const";
import PageMask from "./Page/PageMask";

const trial_api = `${API.base_url}${page_data['api_trial']}`

function Pause(props: {
    done: () => void
}) {
    const [canDone, setCanDone] = React.useState(false);
    setTimeout(() => {
        setCanDone(true);
    }, (DEBUG ? 3 : 60) * 1000)
    return canDone ? <PageMask text={<div style={{cursor: 'default'}}>
        <p>请继续实验</p>
        <span className={classes.fakeButton} onClick={props.done}>继续试验</span>
    </div>}/> : <PageMask text={'请休息1分钟'}/>
}

export default function Experiment() {

    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [startedIndex, setStartedIndex] = React.useState(0);
    const [isDone, setIsDone] = React.useState(false);
    const [breakTimes, setBreakTimes] = React.useState(0);

    const [isBreak, setIsBreak] = React.useState(false);

    useEffect(() => {
        axios.get(trial_api).then(response => {
            const data = response.data.data;
            if (data.last_trial_index === data.trials.length) {
                setIsDone(true);
            } else {
                setTrialDataList(data.trials);
                setCurrentIndex(data.last_trial_index);
                setBreakTimes(data.break_times);
            }
        })
    }, []);

    return (trialDataList.length) > 0 ? (isBreak ? <Pause done={() => {
        setIsBreak(false);
        setCurrentIndex(i => i + 1)
        setStartedIndex(i => i + 1)
    }}/> : <Trial
        trial={trialDataList[currentIndex]}
        done={() => {
            if (currentIndex + 1 === trialDataList.length) {
                setIsDone(true);
            } else if ((currentIndex + 1) % breakTimes === 0) {
                setIsBreak(true);
            } else {
                setCurrentIndex(i => i + 1)
                setStartedIndex(i => i + 1)
            }
        }}
        startedIndex={startedIndex}
    />) : isDone ? <div className={classes.screen} style={{cursor: 'default'}}>
        <div className={classes.content}>
            <p className={classes.descriptionText}>已完成</p>
            <p className={classes.descriptionTextSmall}>感谢你，{
                localStorage.getItem('username') ? localStorage.getItem('username') + '，' : ''
            }为心理学事业的发展做出贡献！</p>
            <div style={{marginTop: '6rem'}}>
                <span
                    className={classes.fakeButton}
                    onClick={() => {
                        localStorage.removeItem('username');
                        window.location.href = '/st/logout/';
                    }}
                >退出实验</span>
            </div>
        </div>
    </div> : <PageMask/>
}
