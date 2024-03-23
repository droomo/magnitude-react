import WSRC from "../WSRC";
import {API, page_data, WS_CONTROL_COMMAND} from "../../const";
import React from "react";
import {Button} from "antd";
import axios from "axios";
import Login, {SubjectFormValues} from "../Login";

export default class Control extends WSRC<{}, {
    subject: SubjectFormValues | null
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
                >Start VR Session</Button>
                <Button
                    onClick={() => {
                        this.sendCommand(WS_CONTROL_COMMAND.enter_room)
                    }}
                >Enter Room</Button>
                <Button
                    onClick={() => {
                        this.sendCommand(WS_CONTROL_COMMAND.enter_shape)
                    }}
                >Enter Shape</Button>
                <Button
                    onClick={() => {
                        this.sendCommand(WS_CONTROL_COMMAND.start_test)
                    }}
                >Start Test Trial</Button>
                <Button
                    onClick={() => {
                        this.sendCommand(WS_CONTROL_COMMAND.start_exp)
                    }}
                >Start Formal Exp</Button>
                <Button
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
