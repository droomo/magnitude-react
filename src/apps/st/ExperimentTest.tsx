import React, {useState} from "react";
import {API, BlockType, getCsrfToken, page_data} from "../const";
import Trial, {TrialData} from "./Trial";
import PageMask from "./Page/PageMask";
import classes from "./css/exp.module.scss";
import {useNavigate} from "react-router-dom";
import {HelperText} from "./Page/HelperText";
import axios from "axios";


export default function ExperimentTest(props: {
    blockType: BlockType
}) {
    const [trialDataList, setTrialDataList] = React.useState<TrialData[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [startedIndex, setStartedIndex] = useState(0);

    const navigate = useNavigate();

    function requestTrial() {
        axios.post(`${API.base_url}${page_data['api_make_test_trial']}`, {
            'reaction_type': props.blockType === BlockType.Space ? 'S' : 'T'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        }).then(response => {
            const data: {
                trials: TrialData[],
                last_trial_index: number
            } = response.data.data;
            data.trials[0].room_duration = 6000;
            setTrialDataList(data.trials);
            setCurrentIndex(data.last_trial_index);
            setStartedIndex(0);
        })
    }

    return <>
        {trialDataList.length > 0 &&
            <Trial
                trial={trialDataList[currentIndex]}
                done={() => {
                    if (currentIndex + 1 === trialDataList.length) {
                        setTrialDataList([]);
                    }
                    setCurrentIndex(i => i + 1);
                    setStartedIndex(i => i + 1);
                }}
                startedIndex={startedIndex}
                helperText={props.blockType === BlockType.Space ?
                    {
                        scene: currentIndex < 3 ? <HelperText>
                            <p>请观察你所处的空间大小，并感受时间的流逝</p>
                            <p>稍后需要你还原这个<strong style={{color: 'red'}}>房间的大小</strong></p>
                        </HelperText> : undefined,
                        reaction: currentIndex < 3 ? <HelperText>
                            <p>请复现空间</p>
                            <p>控制多面体的大小反应你感受到的房间的<strong style={{color: 'red'}}>相对大小</strong></p>
                            <p>只要求大小比例对应，不要求体积绝对相符</p>
                            <strong>如何控制？</strong>
                            <p>1. 使用鼠标滚轮控制多面体的体积</p>
                            <p>2. 完成后，点击下方的“完成”按钮</p>
                        </HelperText> : undefined
                    } : {
                        scene: currentIndex < 3 ? <HelperText>
                            <p>请感受时间的流逝，并观察现在你所处的空间大小</p>
                            <p>稍后需要你还原在这个房间<strong style={{color: 'red'}}>所经历的时间</strong></p>
                        </HelperText> : undefined,
                        reaction: currentIndex < 3 ? <HelperText>
                            <p>请复现时距</p>
                            <p>尽可能反应你在房间中体验到的时长</p>
                            <strong>如何控制？</strong>
                            <p>开始计时：“&nbsp;<strong
                                style={{fontSize: '4rem', fontWeight: "bolder"}}>+</strong>&nbsp;”出现时自动开始计时</p>
                            <p>结束计时：请点击鼠标左键</p>
                        </HelperText> : undefined
                    }
                }
            />
        }
        {trialDataList.length === 0 && <PageMask text={<div style={{
            cursor: 'default'
        }}>
            <div className={classes.content}>
                <p className={classes.descriptionTextSmall}>相信你已经比较熟悉游戏所呈现的场景了</p>
                <p className={classes.descriptionTextSmall}>下面进入实验流程，正式实验一旦开始则无法退出，过程中有休息时间</p>
                <p className={classes.descriptionTextSmall}>现在，你可以进行几组正式实验前的练习</p>
                <div>
                    <span onClick={requestTrial} className={classes.fakeButton}>（重新）开始练习</span>
                </div>
                <div style={{marginTop: '4rem'}}>
                    <span
                        onClick={() => {
                            navigate('/')
                        }}
                        className={classes.fakeButton}
                        style={{color: 'red'}}
                    >开始正式实验</span>
                </div>
            </div>
        </div>}/>}
    </>
}
