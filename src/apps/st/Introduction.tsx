import {Route, Routes, useNavigate} from "react-router-dom";
import React from "react";
import classes from "./css/exp.module.scss";
import PageMask from "./Page/PageMask";
import {Col, Row} from "antd";
import {API, BlockType, getCsrfToken, loader_selector, material_map, page_data} from "../const";
import SceneRoomPractice, {TypeExploringRecord} from "./Scene/SceneRoomPractice";
import axios from "axios";

function Description() {
    const navigate = useNavigate();
    return <PageMask
        text={<div style={{cursor: 'default', padding: '8rem 0'}}>
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

function SceneIntro(props: {
    blockType: BlockType
}) {
    const navigate = useNavigate();

    return <SceneRoomPractice
        done={(record: TypeExploringRecord) => {
            axios.post(`${API.base_url}${page_data['api_exploring_stat']}`, record, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken()
                }
            }).then(response => {
                if (response.data.status === 200) {
                    if (props.blockType === 'time') {
                        navigate('/st/test/time/')
                    } else if (props.blockType === 'space') {
                        navigate('/st/test/space/')
                    }
                } else {
                    alert('error')
                }
            })
        }}
        room={{width: 10, height: 10, depth: 10, wall: 1, ground: 1, duration: 10000}}
    />
}

function Introduction() {
    for (const material_name of Object.values(material_map)) {
        loader_selector(material_name).load(material_name, function (texture) {
            console.log(`{${texture.uuid}} ${material_name} loaded`);
        });
    }
    return (
        <Routes>
            <Route path="/" element={<Description/>}/>
            <Route path="/scene/space/" element={<SceneIntro blockType={BlockType.Space}/>}/>
            <Route path="/scene/time/" element={<SceneIntro blockType={BlockType.Time}/>}/>
        </Routes>
    );
}

export default Introduction;