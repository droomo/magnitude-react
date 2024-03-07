import React, {useEffect, useState} from "react";
import {API, DELAY_TRIAL_START_MASK, getCsrfToken, page_data} from "../const";
import {TrialData, TrialProcess} from "./Trial";
import axios from "axios";
import PageMask from "./Page/PageMask";
import classes from "./css/exp.module.scss";
import {useNavigate} from "react-router-dom";
import {HelperText} from "./Page/HelperText";


export default function ExperimentTest() {
    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [startedIndex, setStartedIndex] = useState(0);

    const [showAlert, setShowAlert] = useState(false);

    const navigate = useNavigate();

    function requestTrial() {
        axios.post(`${API.base_url}${page_data['api_make_test_trial']}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        }).then(response => {
            const data = response.data.data
            setTrialDataList(data.trials);
        })
    }

    useEffect(() => {
        if (trialDataList.length > 0) {
            setTimeout(() => {
                setShowAlert(currentIndex < 3);
                setTimeout(() => {
                    setShowAlert(false);
                }, 3000);
            }, DELAY_TRIAL_START_MASK);
        }
    }, [currentIndex, trialDataList.length]);

    return trialDataList.length > 0 ? <>
            <TrialProcess
                trial={trialDataList[currentIndex]}
                done={() => {
                    if (currentIndex + 1 === trialDataList.length) {
                        setTrialDataList([])
                    }
                    setCurrentIndex(i => i + 1)
                    setStartedIndex(i => i + 1)
                }}
                startedIndex={startedIndex}
            />
            {showAlert && <HelperText>
                <span className={classes.blinkText}>请直接按E键开门</span>
            </HelperText>}
        </> :
        <PageMask text={<div style={{
            cursor: 'default'
        }}>
            <div className={classes.content}>
                <p className={classes.descriptionTextSmall}>正式实验一旦开始则无法退出，过程中有休息时间</p>
                <p className={classes.descriptionTextSmall}>现在，你可以进行几组正式实验前的练习</p>
                <div>
                    <span onClick={requestTrial} className={classes.fakeButton}>（重新）开始练习</span>
                </div>
                <div style={{marginTop: '4rem'}}>
                    <span
                        onClick={() => {
                            navigate('/st/')
                        }}
                        className={classes.fakeButton}
                        style={{color: 'red'}}
                    >开始正式实验</span>
                </div>
            </div>
        </div>}/>
}
