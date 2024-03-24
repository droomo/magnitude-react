import React from 'react';
import {eyeHeight, createWalls, webGlConfig, addLight,} from './scene.lib';
import {API, BlockType, getCsrfToken, getTimestamp, page_data, WS_CONTROL_COMMAND} from "../../const";
import WSRC, {TypeSendData} from "../WSRC";
import classes from "../css/exp.module.scss";
import PureShapeRadius from "./PureShapeRadius";
import * as THREE from 'three';
import {message} from "antd";
import axios from "axios";
import {TypeSubject} from "../Login";

interface TrialData {
    reaction_type: string
    done: boolean
    id: number
    duration: number
    width: number
    depth: number
    height: number
    reaction_speed: number
}


interface TypeRoomStat {
    stage_started_date: number,
    stage_started: number,
    camera_moved_fss: number,
    done_from_camera_moved_fss: number,
}

export interface TypeExploringRecord {
    start_date: number,
    end_date: number,
    key_pressed: string,
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
    private shapeScene: PureShapeRadius | null;
    private trials: TrialData[]
    private trial: TrialData | undefined
    private roomStat: TypeRoomStat | undefined;
    private lookingCenter: boolean

    protected lastTime: number;
    protected frames: number;
    protected frameRate: number;
    private shouldSwitchShape: boolean;

    private wallGroup: THREE.Group;

    constructor(props: any) {
        super(props);
        this.divRef = React.createRef<HTMLDivElement>();
        this.startButtonRef = React.createRef<HTMLButtonElement>();

        this.renderer = new THREE.WebGLRenderer(webGlConfig);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

        this.scene = new THREE.Scene();

        this.trials = [];
        this.lookingCenter = false;
        this.shouldSwitchShape = false;

        this.lastTime = (new Date()).getTime();
        this.frames = 0;
        this.frameRate = 60;

        this.state = {
            subject: null
        }
        this.shapeScene = null;
        this.wallGroup = new THREE.Group()
    }

    switchRoomScene() {
        this.clearScene();

        this.trial = this.trials.shift();
        let room: TypeRoom
        if (this.trial) {
            room = {
                width: this.trial.width,
                height: this.trial.height,
                depth: this.trial.depth,
            }
        } else {
            room = {
                height: 3,
                width: 4,
                depth: 5,
            }
        }
        addLight(this.scene, room);

        createWalls(room,
            wallGroup => {
                this.wallGroup = wallGroup;

                this.scene.add(this.wallGroup);

                this.roomStat = {
                    stage_started_date: new Date().getTime(),
                    stage_started: getTimestamp(),
                    camera_moved_fss: 0,
                    done_from_camera_moved_fss: 0,
                }
                this.lookingCenter = false;
                this.shouldSwitchShape = false;

                this.camera.position.set(0, eyeHeight, -room.depth * 0.5 + 0.1);
                this.camera.lookAt(0, eyeHeight, 0);

                if (this.trial) {
                    console.log(9898888888888)
                    this.lookingCenter = true;
                }
            }
        );
    }

    switchShapeScene = () => {
        this.clearScene();

        this.camera.position.set(0, 0, 30);
        this.camera.add(new THREE.PointLight(0xffffff, 3, 0, 0));

        this.shapeScene = new PureShapeRadius({
            renderer: this.renderer,
            camera: this.camera,
            scene: this.scene,
            done: (result) => {
                this.shapeScene?.clear();

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
                            if (this.trials.length) {
                                this.switchRoomScene();
                            } else {
                                this.sendCommand('done');
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
                this.shapeScene = null;
            }
        })
    }

    clearScene() {
        this.shapeScene?.clear();
        this.scene.clear();
        while (this.wallGroup.children.length) {
            this.wallGroup.remove(this.wallGroup.children[0]);
        }
        // this.scene = new THREE.Scene();
        this.camera.clear();
        // this.scene.add(this.camera);
        this.renderer.setAnimationLoop(this.animate);
        this.setupAspect();
    }

    requestTrial = (trial_type: string) => {
        axios.get(`${API.base_url}${page_data['api_make_or_get_trial']}`, {
            params: {
                'reaction_type': BlockType.Space,
                'trial_type': trial_type,
            }
        }).then(response => {
            const data: {
                trials: TrialData[],
                last_trial_index: number
            } = response.data.data;

            if (trial_type === 'T') {
                data.trials[0].duration = 6000;
            }

            this.trials = data.trials;

            this.switchRoomScene();
        })
    }

    componentDidMount() {
        super.componentDidMount()

        this.requestUser()

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
        axios.get(`${API.base_url}${page_data['api_subject']}`).then(resp => {
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
            console.log(`FPS: ${this.frameRate}`);
            this.frames = 0;
            this.lastTime = currentTime;
        }

        if (this.lookingCenter && this.roomStat) {
            this.lookingCenter = false;
            this.roomStat.camera_moved_fss = getTimestamp();
            console.log(2222222222)
        } else {
            console.log(11111111111122)
            if (this.trial && this.roomStat && this.trial.duration - (getTimestamp() - this.roomStat.camera_moved_fss) < 500 / this.frameRate) {
                this.shouldSwitchShape = true;
                // this.scene = new THREE.Scene();
                this.scene.clear();
                console.log(111111111133);
            }
        }

        this.renderer.render(this.scene, this.camera);

        if (this.shouldSwitchShape) {
            this.shouldSwitchShape = false;
            this.roomStat!.done_from_camera_moved_fss = getTimestamp() - this.roomStat!.camera_moved_fss;
            this.roomStat!.camera_moved_fss -= this.roomStat!.stage_started;

            console.log(this.roomStat)

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
                    if (response.data.status !== 200) {
                        alert('error happened 11')
                    }
                }).catch(() => {
                    alert('error happened 22')
                })
            }

            this.switchShapeScene();

        }

    };

    startSession = () => {
        if (this.renderer.xr.getSession()) {
            return
        }
        const xr = navigator.xr!;
        xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor', 'bounded-floor', 'layers']
        }).then((session) => {
            this.renderer.xr.setSession(session);
            this.switchRoomScene();
        }).catch((err) => {
            this.sendCommand(`${err}`);
            message.error(`Error happened while starting VR session: ${err}`);
        });
    }

    endSession = () => {
        this.clearScene()
        this.renderer.xr.getSession()?.end()
    };

    setupAspect = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    };


    onMessage = (data_str: string) => {
        const data: TypeSendData = JSON.parse(data_str);
        console.log('action', data.action)
        switch (data.action) {
            case WS_CONTROL_COMMAND.loss_session:
                this.endSession();
                break;
            case WS_CONTROL_COMMAND.start_session:
                this.startSession();
                break;
            case WS_CONTROL_COMMAND.enter_shape:
                this.switchShapeScene();
                break;
            case WS_CONTROL_COMMAND.enter_room:
                this.switchRoomScene();
                break;
            case WS_CONTROL_COMMAND.start_test_exp:
                this.requestTrial('T');
                break;
            case WS_CONTROL_COMMAND.start_formal_exp:
                this.requestTrial('F');
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