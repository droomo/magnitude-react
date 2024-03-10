import React, {useEffect} from "react";
import Trial, {TrialData} from "./Trial";
import classes from "./css/exp.module.scss";
import axios from "axios";
import {API, DEBUG, page_data} from "../const";
import PageMask from "./Page/PageMask";
import {useNavigate} from "react-router-dom";

const trial_api = `${API.base_url}${page_data['api_trial']}`

function Pause(props: {
    text: string,
    time: number,
    done: () => void
}) {
    const [canDone, setCanDone] = React.useState(false);
    setTimeout(() => {
        setCanDone(true);
    }, (DEBUG ? 3 : props.time) * 1000)
    return canDone ? <PageMask text={<div style={{cursor: 'default'}}>
        <p>请继续实验</p>
        <span className={classes.fakeButton} onClick={props.done}>继续实验</span>
    </div>}/> : <PageMask text={props.text}/>
}

export default function Experiment() {

    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [startedIndex, setStartedIndex] = React.useState(0);
    const [isDone, setIsDone] = React.useState(false);
    const [breakTimes, setBreakTimes] = React.useState(0);

    const [breakType, setBreakType] = React.useState(0);
    const [end_reason, setEndReason] = React.useState<string>('');
    const [last_reaction_type_trial_id, set_last_reaction_type_trial_id] = React.useState<number>(-1);

    const navigate = useNavigate();

    useEffect(() => {
        axios.get(trial_api).then(response => {
            const data = response.data;

            if (data.status === 204) {
                setIsDone(true);
            } else {
                const trials = data.trials;
                setEndReason(data.end_reason);
                set_last_reaction_type_trial_id(data.last_reaction_type_trial_id);
                setTrialDataList(trials.trials);
                setCurrentIndex(trials.last_trial_index);
                setBreakTimes(trials.break_times);
            }
        })
    }, []);

    return <>
        {
            trialDataList.length > 0 && (breakType > 0 ? <Pause
                done={() => {
                    if (breakType === 1) {
                        setCurrentIndex(i => i + 1)
                        setStartedIndex(i => i + 1)
                    } else {
                        navigate('/intro/');
                    }
                    setBreakType(0);
                }}
                time={breakType === 1 ? 60 : 60 * 3}
                text={breakType === 1 ? '请休息1分钟' : '已经完成一组实验，请休息3分钟，之后开始下一组'}
            /> : <Trial
                trial={trialDataList[currentIndex]}
                done={() => {
                    if (end_reason === 'need_change_block' && last_reaction_type_trial_id === trialDataList[currentIndex].id) {
                        setBreakType(2);
                    } else if (currentIndex + 1 === trialDataList.length) {
                        if (end_reason === 'done') {
                            setIsDone(true);
                        } else {
                            alert('error happened 94133');
                        }
                    } else if ((currentIndex + 1) % breakTimes === 0) {
                        setBreakType(1);
                    } else {
                        setCurrentIndex(i => i + 1)
                        setStartedIndex(i => i + 1)
                    }
                }}
                startedIndex={startedIndex}
            />)
        }
        {
            isDone && <div className={classes.screen} style={{cursor: 'default'}}>
                <div className={classes.content}>
                    <p className={classes.descriptionText}>实验已完成</p>
                    <p className={classes.descriptionTextSmall}>感谢你，{
                        localStorage.getItem('username') ? localStorage.getItem('username') + '，' : ''
                    }为心理学事业的发展做出贡献！</p>
                    <div style={{marginTop: '6rem'}}>
                        <span
                            className={classes.fakeButton}
                            onClick={() => {
                                localStorage.removeItem('username');
                                window.location.href = '/logout/';
                            }}
                        >退出实验</span>
                    </div>
                </div>
            </div>
        }
    </>
}
