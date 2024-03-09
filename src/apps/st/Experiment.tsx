import React, {useEffect} from "react";
import Trial, {TrialData} from "./Trial";
import classes from "./css/exp.module.scss";
import axios from "axios";
import {API, page_data} from "../const";
import PageMask from "./Page/PageMask";

const trial_api = `${API.base_url}${page_data['api_trial']}`

export default function Experiment() {

    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [startedIndex, setStartedIndex] = React.useState(0);
    const [isDone, setIsDone] = React.useState(false);

    useEffect(() => {
        axios.get(trial_api).then(response => {
            const data = response.data.data;
            setTrialDataList(data.trials);
            setCurrentIndex(data.last_trial_index);
        })
    }, []);

    return trialDataList.length > 0 ? <Trial
        trial={trialDataList[currentIndex]}
        done={() => {
            if (currentIndex + 1 === trialDataList.length) {
                setIsDone(true);
            } else {
                setCurrentIndex(i => i + 1)
                setStartedIndex(i => i + 1)
            }
        }}
        startedIndex={startedIndex}
    /> : isDone ? <div className={classes.screen} style={{cursor: 'default'}}>
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
    </div> : <PageMask text={'Loading...'}/>
}
