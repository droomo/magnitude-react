import {Route, Routes, useNavigate} from "react-router-dom";
import React, {useEffect} from "react";
import classes from "./css/exp.module.scss";
import PageMask from "./Page/PageMask";
import {Col, Row} from "antd";
import {API, getCsrfToken, page_data} from "../const";
import SceneRoomPractice, {TypeExploringRecord} from "./Scene/SceneRoomPractice";
import axios from "axios";

function Description() {
    const navigate = useNavigate();
    return <PageMask
        text={<div style={{cursor: 'default', padding: '8rem 0'}}>
            <h1 style={{fontSize: '3rem', margin: '-2rem 0 3rem 0'}}>欢迎参与时空探索实验</h1>
            <p style={{margin: '5px 0', fontSize: '2rem'}}>实验需要重复多次完成任务，接下来的实验需要复现<strong
                style={{color: "red"}}>空间</strong></p>
            <p/>
            <p style={{margin: '5px 0', fontSize: '2rem'}}>实验任务包含<strong
                style={{color: 'red'}}>体验</strong>和<strong style={{color: 'red'}}>再现</strong>两个环节</p>
            <Row>
                <Col span={10} offset={1}>
                    <p style={{
                        margin: '5px 0',
                        marginTop: '40px',
                        fontSize: '3rem',
                    }}><span style={{fontWeight: 'bold'}}>体验环节</span></p>
                    <div style={{textAlign: 'center'}}>
                        <p style={{
                            margin: '5px 0',
                            fontSize: '1.8rem',
                            marginTop: '20px'
                        }}>想象自己处在看到的虚拟房间中</p>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <img src={`${API.texture_base_url}/src/room.png`} style={{width: '50%'}} alt='room'/>
                    </div>
                </Col>
                <Col span={1}>
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
                                fill="#ffffff"/>
                        </svg>
                    </div>
                </Col>
                <Col span={10}>
                    <p style={{
                        margin: '5px 0',
                        marginTop: '40px',
                        fontSize: '3rem',
                    }}><span style={{fontWeight: 'bold'}}><strong style={{color: "red"}}>空间</strong></span>再现</p>
                    <div style={{textAlign: 'center'}}>
                        <p style={{
                            margin: '5px 0',
                            fontSize: '1.8rem',
                            marginTop: '20px'
                        }}>使用鼠标滚轮控制大小</p>
                    </div>
                    <div style={{textAlign: 'center'}}>
                        <img src={`${API.texture_base_url}/src/space.png`}
                             style={{width: '50%'}}
                             alt="space"/>
                    </div>
                </Col>
            </Row>
            <span
                onClick={() => {
                    navigate(`/intro/space/`)
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
                    navigate('/intro/');
                }}
            >切换</span>
        </div>}
    />
}

function SceneIntro() {
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
                    navigate('/test/space/')
                } else {
                    alert('error')
                }
            })
        }}
        room={{width: 10.4, height: 5, depth: 10, duration: 10000}}
    />
}

function Introduction() {
    const [exp_done, setExp_done] = React.useState<boolean>();

    useEffect(() => {
        axios.get(`${API.base_url}${page_data['api_first_reaction_type']}`).then(response => {
            setExp_done(response.data.exp_done);
        });
    }, [])

    return (
        <Routes>
            <Route path="/" element={exp_done ?
                <PageMask text={<>
                    <p>已完成实验</p>
                    <a href="/logout/" style={{color: "white"}}>开始新用户</a>
                </>}/> : <Description/>}/>
            <Route path="/space/" element={<SceneIntro/>}/>
        </Routes>
    );
}

export default Introduction;