import WSRC from "../WSRC";
import {API, WS_CONTROL_COMMAND} from "../../const";
import React from "react";
import {Button} from "antd";

export default class Control extends WSRC<{}, {}> {
    constructor(props: any) {
        super(props);
        this.setUrl(`${API.ws_url}/ws/control/`)
    }

    componentDidMount() {
        super.componentDidMount();

        setTimeout(() => {
            this.sendData({
                action: 'ping'
            })
        }, 1000)
    }

    onMessage = () => {

    }

    render(): React.JSX.Element {
        return <>
            <Button
                onClick={() => {
                    this.sendCommand(WS_CONTROL_COMMAND.enter_practice)
                }}
            >开始练习</Button>
            <Button
                onClick={() => {
                    this.sendCommand(WS_CONTROL_COMMAND.exit_practice)
                }}
            >退出练习</Button>
        </>;
    }
}
