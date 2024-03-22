import React from "react";
import {API} from "../const";

export interface TypeSendData {
    action: string,
    data?: any,
}

export default class WSRC<T1, T2> extends React.Component<T1, T2> {
    private ws: null | WebSocket | undefined;
    private pingPid: NodeJS.Timer | undefined;
    private url: string;
    private reconnectInterval: number;

    constructor(props: any) {
        super(props);
        this.ws = undefined;
        this.url = `${API.ws_url}/ws/`;
        this.reconnectInterval = 500;
    }

    setUrl = (url: string) => {
        this.url = url
    }

    sendData = (data: TypeSendData) => {
        this.ws?.send(JSON.stringify(data));
    }

    componentDidMount() {
        this.connect();
    }

    connect = () => {
        if (this.ws === null) {
            console.log('Page ended')
            return;
        }
        if (this.ws !== undefined) {
            console.log('ws already exists')
            return;
        }

        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log("WebSocket connected");
            if (this.pingPid) {
                clearInterval(this.pingPid)
                this.pingPid = undefined
            }
            this.pingPid = setInterval(() => {
                if (this.ws) {
                    this.ws.send(JSON.stringify({
                        action: 'ping',
                    }))
                }
            }, 5 * 1000)

        };

        this.ws.onmessage = (event) => {
            this.onMessage(event.data);
        };

        this.ws.onclose = () => {
            if (this.ws) {
                const onMessage = this.ws.onmessage
                this.ws = undefined
                setTimeout(() => {
                    console.log("WebSocket disconnected. Attempting to reconnect...");
                    this.connect()
                    if (this.ws) {
                        this.ws.onmessage = onMessage
                    }
                }, this.reconnectInterval)
            }
        };

        this.ws.onerror = () => {
            this.ws?.close();
        };
    };

    sendCommand = (command: string) => {
        this.sendData({
            'action': 'transfer',
            'data': {
                'target_action': command
            }
        })
    }

    onMessage = (data: string) => {
        console.log("Received data:", data);
    };

    componentWillUnmount() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        if (this.pingPid) {
            clearInterval(this.pingPid)
        }
        this.pingPid = undefined
    }

    render() {
        return <div>WebSocket Base Component</div>;
    }
}
