import {Route, Routes, useLocation, useNavigate} from "react-router-dom";
import React from "react";
import classes from "./css/exp.module.scss";
import PageMask from "./Page/PageMask";
import {Col, Row} from "antd";
import {API} from "../const";
import SceneShapeRadius from "./Scene/SceneShapeRadius";
import SceneRoomPractice from "./Scene/SceneRoomPractice";
import PageTimeCounter from "./Scene/PageTimeCounter";
import {HelperText} from "./Page/HelperText";

function Description() {
    const navigate = useNavigate();
    return <PageMask
        text={<div style={{cursor: 'default'}}>
            <h1 style={{fontSize: '5rem', margin: '-2rem 0 3rem 0'}}>欢迎参与时空探索实验</h1>
            <p style={{margin: '5px 0', fontSize: '3rem'}}>接下来的实验将分组进行，每组都有多次实验任务</p>
            <p style={{margin: '5px 0', fontSize: '3rem'}}>实验任务包含<strong
                style={{color: 'red'}}>体验</strong>和<strong style={{color: 'red'}}>再现</strong>两个环节</p>
            <Row>
                <Col span={11} offset={1}>
                    <div style={{borderRight: '1px solid #ffffff'}}>
                        <p style={{
                            margin: '5px 0',
                            marginTop: '40px',
                            fontSize: '3rem',
                        }}><span style={{fontWeight: 'bold'}}>体验环节</span>分两步</p>
                        <Row>
                            <Col span={12}>
                                <p style={{
                                    margin: '5px 0',
                                    fontSize: '1.8rem',
                                    marginTop: '20px'
                                }}>1.按键盘E键手动开门进入房间</p>
                            </Col>
                            <Col span={12}>
                                <p style={{
                                    margin: '5px 0',
                                    fontSize: '1.8rem',
                                    marginTop: '20px'
                                }}>2.想象自己处在看到的虚拟房间中</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10} offset={1}>
                                <img src={`${API.texture_base_url}/demo/s1.png`} style={{width: '100%'}} alt='s1'/>
                            </Col>
                            <Col span={2}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <svg className="icon" viewBox="0 0 1024 1024" version="1.1"
                                         xmlns="http://www.w3.org/2000/svg" width="60%">
                                        <path
                                            d="M599.866 108.616c15.075-14.534 39.072-14.09 53.598 0.994l359.926 373.712c14.362 14.912 14.113 38.595-0.56 53.202L631.654 915.96c-14.84 14.773-38.842 14.712-53.607-0.137-14.766-14.848-14.705-38.861 0.136-53.635L894.25 547.563H37.906c-20.725 0-37.566-16.641-37.9-37.298L0 509.638c0-20.946 16.971-37.926 37.906-37.926l859.018-0.001-298.052-309.469c-14.381-14.932-14.089-38.613 0.546-53.187z"
                                            fill="#ababab"/>
                                    </svg>
                                </div>
                            </Col>
                            <Col span={10}>
                                <img src={`${API.texture_base_url}/demo/s1.png`} style={{width: '100%'}} alt='s2'/>
                            </Col>
                        </Row>
                    </div>
                </Col>
                <Col span={11}>
                    <div>
                        <p style={{
                            margin: '5px 0',
                            marginTop: '40px',
                            fontSize: '3rem',
                        }}><span style={{fontWeight: 'bold'}}>再现环节</span>有两种</p>
                        <Row>
                            <Col span={12}>
                                <p style={{
                                    margin: '5px 0',
                                    fontSize: '1.8rem',
                                    marginTop: '20px'
                                }}><strong>空间再现</strong>请使用鼠标滚轮控制大小</p>
                            </Col>
                            <Col span={12}>
                                <p style={{
                                    margin: '5px 0',
                                    fontSize: '1.8rem',
                                    marginTop: '20px'
                                }}><strong>时间再现</strong>请点击鼠标左键控制结束</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={10} offset={1}>
                                <img
                                    src={`${API.texture_base_url}/demo/space.png`}
                                    style={{width: '100%'}} alt='space'
                                />
                            </Col>
                            <Col span={2}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%'
                                }}>
                                    <div style={{height: '90%', borderLeft: '1px solid #ababab'}}/>
                                </div>
                            </Col>
                            <Col span={10}>
                                <img src={`${API.texture_base_url}/demo/s1.png`} style={{width: '100%'}} alt='time'/>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
            <span
                onClick={() => {
                    navigate('/st/intro/scene/')
                }}
                style={{marginTop: '2rem'}}
                className={classes.fakeButton}
            >我已理解，进行下一步</span>
            <span
                style={{
                    position: 'absolute',
                    right: '2rem',
                    bottom: '2rem',
                    fontSize: '1rem',
                    color: '#101010',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    navigate('/st/')
                }}
            >直接开始实验</span>
        </div>}
    />
}

function SceneIntro() {
    const navigate = useNavigate();

    const [stage, setStage] = React.useState(1);
    return <>
        <HelperText>
            {stage === 1 && <>
                <p>游戏的操作同多数电脑游戏一致</p>
                <p>按<strong style={{color: 'red'}}>“WASD”</strong>键控制方向“上左后右”，按<strong
                    style={{color: 'red'}}>“E”</strong>键开门</p>
                <p>请想象你正以第一人称处于游戏环境中</p>
            </>}
            {stage === 2 && <>
                <p>开门后游戏自动带你进入房间，此时不能再移动</p>
                <p>请想象你正以第一人称处于游戏环境中</p>
                <p>尽可能身临其境地体验<strong style={{color: 'red', fontSize: '2.2rem'}}>房间的大小</strong>和<strong
                    style={{color: 'red', fontSize: '2.2rem'}}>在房间内的时长</strong></p>
                <p>一段时间后，页面会自动切换，你需要完成时间或空间再现任务</p>
            </>}
        </HelperText>
        {stage !== 3 && <SceneRoomPractice
            done={() => {
                navigate('/st/intro/control/')
            }}
            onDoorOpen={() => {
                setStage(2)
            }}
            room={{width: 10, height: 10, depth: 10, wall: 1, ground: 1, duration: 10000}}
        />}
    </>
}

function LeaningControl() {
    const navigate = useNavigate();

    return <div className={classes.screen} style={{cursor: 'default'}}>
        <div className={classes.content}>
            <p className={classes.descriptionText}>请复现空间/时距</p>
            <p style={{
                lineHeight: '2',
                fontSize: '2rem'
            }}>现在正处在游戏指引阶段<br/>在正式实验中，将直接进入复现阶段，不需要选择复现种类</p>
            <div>
                    <span
                        style={{
                            border: "1px solid #ccc",
                            marginRight: '2rem'
                        }}
                        onClick={() => {
                            navigate('/st/intro/shape/')
                        }}
                        className={classes.fakeButton}
                    >复现空间</span>
                <span
                    style={{
                        border: "1px solid #ccc",
                        marginLeft: '2rem'
                    }}
                    onClick={() => {
                        navigate('/st/intro/time/')
                    }}
                    className={classes.fakeButton}
                >复现时距</span>
            </div>
            <div style={{
                marginTop: '4rem'
            }}>
                    <span
                        onClick={() => {
                            navigate('/st/intro/scene/', {state: {stageState: 1}})
                        }}
                        className={classes.fakeButton}
                    >重新进入体验阶段</span>
            </div>
            <div style={{
                marginTop: '2rem'
            }}>
                    <span
                        onClick={() => {
                            navigate('/st/test/', {state: {stageState: 1}})
                        }}
                        className={classes.fakeButton}
                    >已经学会操作了，进入练习</span>
            </div>
        </div>
    </div>
}

function ShapeIntro() {
    const navigate = useNavigate();
    return <>
        <HelperText>
            <p>请复现空间</p>
            <p>请使用鼠标滚轮控制多面体的体积</p>
            <p>尽可能反应你在体验阶段感受到的房间体积</p>
            <p>不要求精确还原</p>
            <p>反应你的主观体验即可</p>
            <br/>
            <p>完成后，点击下方的“完成”按钮</p>
        </HelperText>
        <SceneShapeRadius
            isStagePrepared={false}
            done={() => {
                navigate('/st/intro/control/')
            }}
        />
    </>
}

function TimeIntro() {
    const navigate = useNavigate();
    return <>
        <HelperText>
            <p>请复现时距</p>
            <p>尽可能反应你在体验阶段感受到的房间时长</p>
            <p>不要求精确还原</p>
            <p>反应你的主观体验即可</p>
            <p>显示准备后请做好准备</p>
            <p>屏幕中间出现<strong style={{fontSize: '5rem'}}>+</strong>时开始计时</p>
            <p>当达到在体验阶段相同的时距后点击鼠标左键</p>
        </HelperText>
        <PageTimeCounter
            done={() => {
                navigate('/st/intro/control/')
            }}
            shouldStart={true}
        />
    </>
}

function Introduction() {
    return (
        <Routes>
            <Route path="/" element={<Description/>}/>
            <Route path="/control/" element={<LeaningControl/>}/>
            <Route path="/scene/" element={<SceneIntro/>}/>
            <Route path="/shape/" element={<ShapeIntro/>}/>
            <Route path="/time/" element={<TimeIntro/>}/>
        </Routes>
    );
}

export default Introduction;