import WSRC from "../WSRC";
import {API, page_data, WS_CONTROL_COMMAND} from "../../const";
import Login, {TypeSubject} from "../Login";
import React from "react";
import {Button} from "antd";
import axios from "axios";
import classes from '../css/exp.module.scss'


export default class Control extends WSRC<{}, {
    subject: TypeSubject | null
}> {
    constructor(props: any) {
        super(props);
        this.setUrl(`${API.ws_url}/ws/control/`)
        this.state = {
            subject: null
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.requestRunningSubject()
    }

    requestRunningSubject = () => {
        axios.get(`${API.base_url}${page_data.api_subject}`).then((resp) => {
            this.setState({
                subject: resp.data.subject
            })
        })
    }

    onMessage = () => {

    }
    capitalizeFirstLetter = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    render(): React.JSX.Element {
        return <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#ffffff'
        }}>
            {this.state.subject && <>
                <div>
                    <p>学号[ID]: {this.state.subject.code}</p>
                    <p>被试姓名: {this.state.subject.name}</p>
                </div>
                <Button
                    type='primary'
                    onClick={() => {
                        this.sendCommand(WS_CONTROL_COMMAND.start_session)
                    }}
                >Start Session</Button>
                {[
                    'enter_room',
                    'enter_shape',
                    'start_test_exp',
                    'start_formal_exp',
                ].map((command) => {
                    return <div
                        key={command}
                        className={classes.controlButton}
                    >
                        <Button
                            onClick={() => {
                                this.sendCommand(WS_CONTROL_COMMAND[command])
                            }}
                        >{command.split('_').map(x => this.capitalizeFirstLetter(x)).join(' ')}</Button>
                    </div>
                })}
                <Button
                    className={classes.controlButton}
                    danger
                    onClick={() => {
                        this.sendCommand(WS_CONTROL_COMMAND.loss_session)
                    }}
                >Stop VR Session</Button>
            </>}
            {this.state.subject === null && <Login done={(subject) => {
                this.setState({
                    subject: subject
                })
            }}/>}
        </div>
    }
}
