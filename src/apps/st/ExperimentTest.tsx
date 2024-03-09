import React, {useState} from "react";
import {API, BlockType, getCsrfToken, page_data} from "../const";
import {TrialData, TrialProcess} from "./Trial";
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
        axios.post(`${API.base_url}${page_data['api_make_test_trial']}`, {}, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        }).then(response => {
            const data: { trials: TrialData[] } = response.data.data;
            // data.trials[0].room_duration = 10000;
            setTrialDataList(data.trials);
        })
    }

    return <>
        {trialDataList.length > 0 &&
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
                helperText={props.blockType === BlockType.Space ?
                    {
                        scene: currentIndex < 3 ? <HelperText>
                            <p>请观察你所处的空间大小，并感受时间的流逝</p>
                            <p>稍后<strong style={{color: 'red'}}>需要你还原这个房间的大小</strong></p>
                        </HelperText> : undefined,
                        reaction: currentIndex < 3 ? <HelperText>
                            <p>请复现空间</p>
                            <p>请使用鼠标滚轮控制多面体的体积</p>
                            <p>尽可能反应你在体验阶段感受到的房间体积</p>
                            <p>不要求精确还原</p>
                            <p>反应你的主观体验即可</p>
                            <br/>
                            <p>完成后，点击下方的“完成”按钮</p>
                        </HelperText> : undefined
                    } : {
                        scene: currentIndex < 3 ? <HelperText>
                            <p>请感受时间的流逝，并观察现在你所处的空间大小</p>
                            <p>稍后<strong style={{color: 'red'}}>需要你还原在这个房间所经历的时间</strong></p>
                        </HelperText> : undefined,
                        reaction: currentIndex < 3 ? <HelperText>
                            <p>请复现时距</p>
                            <p>尽可能反应你在体验阶段感受到的房间时长</p>
                            <p>不要求精确还原</p>
                            <p>反应你的主观体验即可</p>
                            <p>显示准备后请做好准备</p>
                            <p>屏幕中间出现<strong style={{fontSize: '5rem'}}>+</strong>时开始计时</p>
                            <p>当达到在体验阶段相同的时距后点击鼠标左键</p>
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
                        navigate('/st/')
                    }}
                    className={classes.fakeButton}
                    style={{fontSize: '0.8rem'}}
                >我已不需要练习了，直接开始正式实验</span>
                </div>
            </div>
        </div>}/>}
    </>
}
