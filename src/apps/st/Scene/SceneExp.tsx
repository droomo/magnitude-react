import React from 'react';
import {createWalls, webGlConfig, makeLight, create3DText,} from './scene.lib';
import {API, BlockType, getCsrfToken, getTimestamp, page_data, WS_CONTROL_COMMAND} from "../../const";
import WSRC, {TypeSendData} from "../WSRC";
import classes from "../css/exp.module.scss";
import * as THREE from 'three';
import axios from "axios";
import {TypeSubject} from "../Login";
import {message} from "antd";

export interface TypeTrial {
    done: boolean
    id: number
    duration: number
    width: number
    depth: number
    height: number
    updated_at_room: string | null
    updated_at_reaction: string | null
    running?: boolean
}

interface TypeTimeCounter {
    prep_disappear_date: number
    counter_scene_start_date: number
    pressed_date: number
    counter_scene_start: number
    cross_appear_fss: number // from s  tage start
    pressed_fca: number
    pressed: number
    frames?: number[]
}


interface TypeRoomStat {
    stage_started_date: number,
    stage_started: number,
    camera_moved_fss: number,
    done_from_camera_moved_fss: number,
}

export interface TypeRoom {
    width: number;
    height: number;
    depth: number;
}

const api_trial = `${API.base_url}${page_data['api_trial']}`;

export default class SceneExp extends WSRC<{}, {
    subject: TypeSubject | null
}> {
    private divRef: React.RefObject<HTMLDivElement>;
    private startButtonRef: React.RefObject<HTMLButtonElement>;
    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private scene: THREE.Scene;
    private trials: TypeTrial[]
    private trial: TypeTrial | undefined
    private roomStat: TypeRoomStat | undefined;
    private lookingCenter: boolean

    protected lastTime: number;
    protected trialType: string | undefined;
    protected frames: number;
    protected frameHistory: number[];
    protected frameRate: number;
    private shouldSwitchCounterStage: boolean;
    private shouldDisplayCross: boolean;

    private lastingTimes: number;

    private counter: TypeTimeCounter;

    constructor(props: any) {
        super(props);
        this.divRef = React.createRef<HTMLDivElement>();
        this.startButtonRef = React.createRef<HTMLButtonElement>();

        this.renderer = new THREE.WebGLRenderer(webGlConfig);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

        this.scene = new THREE.Scene();

        this.trials = [];
        this.lookingCenter = false;
        this.shouldSwitchCounterStage = false;
        this.shouldDisplayCross = false;

        this.lastTime = (new Date()).getTime();
        this.frames = 0;
        this.frameHistory = [];
        this.frameRate = 60;

        this.state = {
            subject: null
        }

        this.renderer.setAnimationLoop(this.animate);

        this.lastingTimes = 0;

        this.counter = {
            cross_appear_fss: -1,
            counter_scene_start: -1,
            counter_scene_start_date: -1,
            prep_disappear_date: -1,
            pressed_date: -1,
            pressed_fca: -1,
            pressed: -1,
        }

    }

    initCounter = () => {
        this.counter = {
            cross_appear_fss: -1,
            counter_scene_start: -1,
            counter_scene_start_date: -1,
            prep_disappear_date: -1,
            pressed_date: -1,
            pressed_fca: -1,
            pressed: -1,
        }
    }

    clearScene() {
        this.scene.clear();
    }

    switchRoomScene() {
        this.frameHistory = [];
        if (!this.renderer.xr.getSession()) {
            return
        }
        this.clearScene();
        this.initCounter();

        this.lastingTimes += 1;
        this.scene = new THREE.Scene();

        this.trial = this.trials.shift();

        let room: TypeRoom
        if (this.trial) {
            room = {
                width: this.trial.width,
                height: this.trial.height,
                depth: this.trial.depth,
            }
            this.sendCommand(WS_CONTROL_COMMAND.start_trial_event, {trial_id: this.trial.id})
        } else {
            room = {
                height: 3 + Math.random() * 2,
                width: 4 + Math.random() * 2,
                depth: 5 + Math.random() * 2,
            }
        }

        const text = '准备';
        this.scene.add(create3DText(text));
        this.sendCommand(WS_CONTROL_COMMAND.ready_for_thing, {text});

        const roomScene = new THREE.Scene();

        for (const light of makeLight(room)) {
            roomScene.add(light);
        }

        createWalls(room,
            walls => {
                for (const wall of walls) {
                    roomScene.add(wall);
                }
            }
        );

        setTimeout(() => {
            this.scene = roomScene;
            this.roomStat = {
                stage_started_date: new Date().getTime(),
                stage_started: getTimestamp(),
                camera_moved_fss: -1,
                done_from_camera_moved_fss: -1,
            }
            this.lookingCenter = false;
            this.shouldSwitchCounterStage = false;

            if (this.trial) {
                this.lookingCenter = true;
            }
            this.sendCommand(WS_CONTROL_COMMAND.switch_room, {room})
        }, 500)
    }

    switchTimeCounterScene = () => {
        if (!this.renderer.xr.getSession()) {
            return
        }
        this.clearScene();

        const text = '准备';
        this.scene.add(create3DText(text));
        this.sendCommand(WS_CONTROL_COMMAND.ready_for_thing, {text: '准备'});

        this.counter.counter_scene_start_date = new Date().getTime();

        this.shouldDisplayCross = false;

    }

    trial_done = (result: TypeTimeCounter) => {
        result.frames = this.frameHistory;
        if (this.trial) {
            axios.post(api_trial, {
                stat_reaction: result,
                id: this.trial.id,
                done: true
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCsrfToken(),
                },
            }).then(response => {
                if (response.data.status === 200) {
                    this.trialDone(response.data.data.trial_id);

                    if (this.trials.length) {

                        if (this.lastingTimes % 40 === 0) {
                            const text = '请休息，稍候由主试提醒继续试验';
                            this.scene.add(create3DText(text));
                            this.sendCommand(WS_CONTROL_COMMAND.take_a_break, {text});
                        } else {
                            this.switchRoomScene();
                        }
                    } else {
                        const text = this.trialType === 'F' ? '实验结束，感谢你为心理学的发展做出贡献！' : '练习结束，请稍候'
                        this.scene.add(create3DText(text));
                        this.sendCommand(WS_CONTROL_COMMAND.done_exp_event, {text});
                    }
                } else {
                    alert('error happened 33')
                }
            }).catch(() => {
                alert('error happened 44')
            })
        } else {
            this.switchRoomScene();
        }
    }

    requestTrial = (trial_type: string) => {
        this.trialType = trial_type;

        axios.get(`${API.base_url}${page_data['api_make_or_get_trial']}`, {
            params: {
                'reaction_type': BlockType.Space,
                'trial_type': trial_type,
            }
        }).then(response => {
            const data: {
                trials: TypeTrial[],
                last_trial_index: number
            } = response.data.data;

            this.sendCommand(WS_CONTROL_COMMAND.start_exp_event, {trial_type})

            if (trial_type === 'T') {
                data.trials[0].duration = 6000;
            } else if (trial_type === 'F' && data.trials.length === 0) {
                return
            }

            this.trials = data.trials;
            this.switchRoomScene();
        })
    }

    componentDidMount() {
        super.componentDidMount()

        this.requestUser()

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.renderer.xr.enabled = true;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.5;

        if (this.divRef.current) {
            this.divRef.current.appendChild(this.renderer.domElement);
        }
    }

    requestUser = () => {
        axios.get(`${API.base_url}${page_data['api_subject']}?running=running`).then(resp => {
            this.setState({
                subject: resp.data.subject
            })
        })
    }

    animate = () => {
        const currentTime = (new Date()).getTime();
        this.frames++;

        if (currentTime - this.lastTime >= 1000) {
            this.frameRate = this.frames;
            // console.log(`FPS: ${this.frameRate}`);
            this.frameHistory = [...this.frameHistory, this.frames];
            this.frames = 0;
            this.lastTime = currentTime;
        }

        this.renderer.render(this.scene, this.camera);

        if (this.lookingCenter && this.roomStat) {
            this.lookingCenter = false;
            this.roomStat.camera_moved_fss = getTimestamp();
        } else {
            if (this.trial && this.roomStat && this.roomStat.done_from_camera_moved_fss === -1
                && this.trial.duration - (getTimestamp() - this.roomStat.camera_moved_fss) < 500 / this.frameRate) {
                this.shouldSwitchCounterStage = true;
            }
        }

        if (this.shouldSwitchCounterStage) {
            this.roomStat!.done_from_camera_moved_fss = getTimestamp() - this.roomStat!.camera_moved_fss;
            this.roomStat!.camera_moved_fss -= this.roomStat!.stage_started;

            if (this.trial) {
                axios.post(api_trial, {
                    stat_scene: this.roomStat,
                    id: this.trial.id,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCsrfToken(),
                    },
                }).then(response => {
                    if (response.data.status === 200) {
                        this.trialDone(response.data.data.trial_id)
                    } else {
                        alert('error happened 11')
                    }
                }).catch(() => {
                    alert('error happened 22')
                })
            }
            this.shouldSwitchCounterStage = false;
            this.switchTimeCounterScene();
        } else if (this.counter.cross_appear_fss === -1 && this.counter.counter_scene_start > -1
            && 500 - (getTimestamp() - this.counter.counter_scene_start) < 500 / this.frameRate) {
            this.shouldDisplayCross = true;
            const crossText = create3DText('+');
            this.scene = new THREE.Scene();
            this.scene.add(crossText);
            this.sendCommand(WS_CONTROL_COMMAND.ready_for_thing, {text: '+'});
        } else if (this.counter.counter_scene_start_date > -1 && this.counter.counter_scene_start === -1) {
            this.counter.counter_scene_start = getTimestamp();
        }

        if (this.shouldDisplayCross) {
            this.counter.prep_disappear_date = new Date().getTime();
            this.counter.cross_appear_fss = getTimestamp() - this.counter.counter_scene_start;

            this.shouldDisplayCross = false;

            this.renderer.xr.getSession()!.addEventListener('select', this.handleCompleteClick);
        }

    };

    handleCompleteClick = () => {
        this.counter.pressed_fca = getTimestamp() - this.counter.cross_appear_fss - this.counter.counter_scene_start;
        this.counter.pressed = getTimestamp();
        this.counter.pressed_date = new Date().getTime();
        this.renderer.xr.getSession()!.removeEventListener('select', this.handleCompleteClick);

        this.trial_done(this.counter);
    };

    trialDone = (trial_id: number) => {
        this.sendCommand(WS_CONTROL_COMMAND.done_trial_event, {trial_id})
    }

    startSession = () => {
        if (this.renderer.xr.getSession()) {
            return
        }
        const xr = navigator.xr!;
        xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor', 'bounded-floor', 'layers']
        }).then((session) => {
            this.renderer.xr.setSession(session);

            const text = '欢迎进入实验场景'
            this.scene.add(create3DText(text))

            this.sendCommand(WS_CONTROL_COMMAND.start_session_event, {text})

        }).catch((err) => {
            this.sendCommand(`${err}`);
            message.error(`Error happened while starting VR session: ${err}`);
        });
    }

    endSession = () => {
        this.clearScene()
        this.renderer.xr.getSession()?.end()
    };


    onMessage = (data_str: string) => {
        const data: TypeSendData = JSON.parse(data_str);
        // console.log('action', data.action)
        switch (data.action) {
            case WS_CONTROL_COMMAND.loss_session:
                this.endSession();
                break;
            case WS_CONTROL_COMMAND.start_session:
                this.startSession();
                break;
            case WS_CONTROL_COMMAND.enter_time_counter:
                this.switchTimeCounterScene();
                break;
            case WS_CONTROL_COMMAND.enter_room:
            case WS_CONTROL_COMMAND.continue_trial:
                this.switchRoomScene();
                break;
            case WS_CONTROL_COMMAND.start_test_exp:
                this.lastingTimes = 0;
                this.requestTrial('T');
                break;
            case WS_CONTROL_COMMAND.start_formal_exp:
                this.lastingTimes = 0;
                this.requestTrial('F');
                break;
            case WS_CONTROL_COMMAND.subject_done:
            case WS_CONTROL_COMMAND.subject_login:
                window.location.reload()
                break;
            case WS_CONTROL_COMMAND.logout_session:
                window.location.href = '/logout/';
                break;
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount()
    }

    render() {
        return <div className={classes.scene}>
            {this.state.subject ?
                <>
                    <h3>时空探索虚拟现实（Virtual Reality, VR）实验</h3>
                    <p>欢迎你，{this.state.subject.name}（{this.state.subject.code}）！</p>
                    <button
                        className={classes.buttonStartVR}
                        ref={this.startButtonRef}
                        onClick={() => {
                            this.startSession()
                        }}>开始实验
                    </button>
                    <div ref={this.divRef}/>
                </> :
                <div>
                    <p>实验尚未开始</p>
                </div>
            }
        </div>
    }
}