import React, {useEffect} from "react";
import Trial, {TrialData} from "./Trial";
import classes from "./css/exp.module.scss";
import axios from "axios";
import {API, BlockType, DEBUG, page_data} from "../const";
import PageMask from "./Page/PageMask";
import {useNavigate} from "react-router-dom";


function Pause(props: {
    text: string,
    time: number,
    done: () => void
}) {
    const [canDone, setCanDone] = React.useState(false);
    setTimeout(() => {
        setCanDone(true);
    }, (DEBUG ? 3 : props.time) * 1000);
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
    const [last_trial_id, set_last_trial_id] = React.useState<number>(-1);
    const [blockType, setBlockType] = React.useState<BlockType>(BlockType.Space);

    const navigate = useNavigate();

    function requestTrial(blockType_: string) {
        axios.get(`${API.base_url}${page_data['api_make_or_get_trial']}`, {
            params: {
                'reaction_type': blockType_,
                'trial_type': "F",
            }
        }).then(response => {
            const data = response.data.data;
            const trials: TrialData[] = data.trials;
            set_last_trial_id(data.last_id);
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
                setBlockType(response.data.first_reaction_type)
                requestTrial(response.data.first_reaction_type)
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
                if (breakType === 1) {
                    setCurrentIndex(i => i + 1)
                } else {
                    navigate('/intro/');
                }
                setBreakType(0);
            }}
            time={breakType === 1 ? 30 : 60}
            text={breakType === 1 ? '请休息' : '已经完成一组实验，请休息1分钟，之后开始下一组'}
        /> : <Trial
            trial={trialDataList[currentIndex]}
            done={() => {
                if (blockType === BlockType.Space && last_trial_id === trialDataList[currentIndex].id) {
                    setBreakType(2);
                } else if (currentIndex + 1 === trialDataList.length) {
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
