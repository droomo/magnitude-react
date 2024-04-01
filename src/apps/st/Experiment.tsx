import React, {useEffect} from "react";
import Trial, {TrialData} from "./Trial";
import classes from "./css/exp.module.scss";
import axios from "axios";
import {API, DEBUG, page_data} from "../const";
import PageMask from "./Page/PageMask";

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
        <p>休息好后请继续</p>
        <span className={classes.fakeButton} onClick={props.done}>继续实验</span>
    </div>}/> : <PageMask text={props.text}/>
}

export default function Experiment() {

    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isDone, setIsDone] = React.useState(false);
    const [breakTimes, setBreakTimes] = React.useState(0);

    const [breakType, setBreakType] = React.useState(0);

    function requestTrial() {
        axios.get(`${API.base_url}${page_data['api_make_or_get_trial']}`, {
            params: {
                trial_type: "F",
            }
        }).then(response => {
            const data = response.data;
            const trials: TrialData[] = data.trials;

            setBreakTimes(data.break_times);
            let i = 0;
            for (const t of trials) {
                if (!t.done) {
                    setCurrentIndex(i)
                    break
                }
                i++;
            }
            setTrialDataList(trials);
        })
    }

    useEffect(() => {
        axios.get(`${API.base_url}${page_data['api_first_reaction_type']}`).then(response => {
            if (response.data.exp_done) {
                setIsDone(true);
            } else {
                requestTrial()
            }
        });
    }, []);

    return <>
        {isDone ? (<div className={classes.screen} style={{cursor: 'default'}}>
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
        </div>) : trialDataList.length > 0 && (breakType > 0 ? <Pause
            done={() => {
                setCurrentIndex(i => i + 1)
                setBreakType(0);
            }}
            time={30} //s
            text='请休息'
        /> : <Trial
            trial={trialDataList[currentIndex]}
            done={() => {
                if (currentIndex + 1 === trialDataList.length) {
                    setIsDone(true);
                } else if ((currentIndex + 1) % breakTimes === 0) {
                    setBreakType(1);
                } else {
                    setCurrentIndex(i => i + 1)
                }
            }}
        />)}
    </>
}
