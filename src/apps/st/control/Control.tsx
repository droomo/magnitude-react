import WSRC, {TypeSendData} from "../WSRC";
import {API, getCsrfToken, page_data, WS_CONTROL_COMMAND} from "../../const";
import Login, {TypeSubject} from "../Login";
import React from "react";
import axios from "axios";
import classes from '../css/exp.module.scss'
import {TypeTrial} from "../Scene/SceneExp";
import {Button, Chip, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import DoneIcon from '@mui/icons-material/Done';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SceneControl, {TypeRoom} from "./SceneControl";
import {Col, Row} from "antd";


const sideWidth = 60;

interface TypeColumn {
    title: string
    width: number
    index?: keyof TypeTrial
    render?: (v: TypeTrial) => void
}

const columns: TypeColumn[] = [
    {
        title: 'ID',
        index: 'id',
        width: 50,
    },
    {
        title: 'W',
        index: 'width',
        width: sideWidth,
    },
    {
        title: 'H',
        index: 'height',
        width: sideWidth,
    },
    {
        title: 'D',
        index: 'depth',
        width: sideWidth,
    },
    {
        title: 'Size',
        width: sideWidth * 1.5,
        render: (v) => v.height * v.width * v.depth,
    },
    {
        title: 'Dur',
        width: sideWidth * 1.5,
        render: (v) => <>{v.duration / 1000} S </>,
    },
    {
        title: 'Stage',
        width: 120,
        render: (v) => {
            const shapeDone = v.updated_at_room !== null;
            const reactionDone = v.updated_at_reaction !== null;
            return <>
                <Chip label="ROOM" color={shapeDone ? 'success' : reactionDone ? 'primary' : 'default'}
                      variant="outlined" size="small" icon={shapeDone ? <DoneIcon/> : <HourglassEmptyIcon/>}
                />
                <Chip label="SHAPE" color={reactionDone ? 'success' : shapeDone ? 'primary' : 'default'}
                      variant="outlined" size="small" icon={reactionDone ? <DoneIcon/> : <HourglassEmptyIcon/>}
                />
            </>
        },
    }
];

export default class Control extends WSRC<{}, {
    subject: TypeSubject | null,
    trials: TypeTrial[]
}> {
    private updateRoom: (room: TypeRoom) => void;
    private updateShape: (radius: number, newShape: boolean) => void;

    constructor(props: any) {
        super(props);
        this.setUrl(`${API.ws_url}/ws/control/`)
        this.state = {
            subject: null,
            trials: []
        }
        this.updateRoom = () => {
        }
        this.updateShape = () => {
        }
    }

    componentDidMount() {
        super.componentDidMount();
        this.requestRunningSubject()
    }

    requestRunningSubject = () => {
        axios.get(`${API.base_url}${page_data.api_subject}?running=running`).then((resp) => {
            this.setState({
                subject: resp.data.subject
            })
        })
    }

    requestRunningTrials = (trial_type: string) => {
        axios.get(`${API.base_url}${page_data.api_make_or_get_trial}`, {
            params: {
                control: 'control',
                trial_type: trial_type
            }
        }).then((resp) => {
            this.setState({
                trials: resp.data.trials
            })
        })
    }
    updateTrial = (trial_id: number) => {
        axios.get(`${API.base_url}${page_data.api_trial}`, {
            params: {
                trial_id: trial_id
            }
        }).then((resp) => {
            const trial: TypeTrial = resp.data.data;

            this.setState({
                trials: this.state.trials.map(item => {
                    if (item.id === trial.id) {
                        return {...item, ...trial};
                    }
                    return item;
                })
            })

        })
    }

    onMessage = (data_str: string) => {
        const data: TypeSendData = JSON.parse(data_str);

        switch (data.action) {
            case WS_CONTROL_COMMAND.start_exp_event :
                this.requestRunningTrials(data.data.trial_type);
                break;
            case WS_CONTROL_COMMAND.done_trial_event:
                this.updateTrial(data.data.trial_id)
                break
            case WS_CONTROL_COMMAND.switch_room:
                this.updateRoom(data.data.room)
                break;
            case WS_CONTROL_COMMAND.switch_shape:
                this.updateShape(data.data.radius, data.data.newShape)
                break;
        }
    }

    capitalizeFirstLetter = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    render(): React.JSX.Element {
        return <div className={classes.controlPage}>
            {this.state.subject && <Row>
                <Col span={6} className={classes.controlWrapper}>
                    <div className={classes.buttonGroup}>
                        <div>
                            <p>Name: {this.state.subject.name}</p>
                            <p>Code(ID): {this.state.subject.code}</p>
                        </div>
                        <Divider>Starting session not working under real quest2 device</Divider>
                        <Button
                            className={classes.controlButton}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                this.sendCommand(WS_CONTROL_COMMAND.start_session)
                            }}
                        >Start Session</Button>
                        <Divider>Practice stage</Divider>
                        {[
                            'enter_room',
                            'enter_shape',
                            'start_test_exp',
                        ].map((command) => {
                            return <Button
                                key={command}
                                className={classes.controlButton}
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                    this.sendCommand(WS_CONTROL_COMMAND[command])
                                }}
                            >{command.split('_').map(x => this.capitalizeFirstLetter(x)).join(' ')}</Button>
                        })}
                        <Divider>Formal stage</Divider>
                        <Button
                            className={classes.controlButton} style={{margin: '2rem 0'}}
                            variant="contained"
                            size="small"
                            onClick={() => {
                                this.sendCommand(WS_CONTROL_COMMAND.start_formal_exp)
                            }}
                        >Start an formal Exp</Button>
                        <Divider>Ending session</Divider>
                        <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            className={classes.controlButton}
                            onClick={() => {
                                this.sendCommand(WS_CONTROL_COMMAND.loss_session)
                            }}
                        >Stop VR Session</Button>
                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            className={classes.controlButton}
                            onClick={() => {
                                axios.post(`${API.base_url}${page_data.api_subject_done}`, {
                                    subject_code: this.state.subject?.code
                                }, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'X-CSRFToken': getCsrfToken(),
                                    }
                                }).then(() => {
                                    this.requestRunningSubject()
                                    this.sendCommand(WS_CONTROL_COMMAND.subject_done)
                                })
                            }}
                        >Logout Subject</Button>
                    </div>
                </Col>
                <Col span={16}>
                    <TableContainer sx={{height: '50vh'}}>
                        <Table stickyHeader size="medium">
                            <TableHead>
                                <TableRow>
                                    {columns.map((column, index) => <TableCell
                                            key={index}
                                            align='left'
                                            style={{minWidth: column.width}}
                                        >{column.title}</TableCell>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {this.state.trials
                                    .map((row) => {
                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                                {columns.map((column) => {
                                                    return <TableCell key={column.title} align='left'>
                                                        <>{column.render ? column.render(row) : row[column.index!]}</>
                                                    </TableCell>
                                                })}
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <SceneControl
                        setSwitchRoom={(callback) => {
                            this.updateRoom = callback
                        }}
                        setSwitchShape={(callback) => {
                            this.updateShape = callback
                        }}
                    />
                </Col>
            </Row>
            }

            {this.state.subject === null && <Login done={(subject) => {
                this.sendCommand(WS_CONTROL_COMMAND.subject_login)
                this.setState({
                    subject: subject
                })
            }}/>}
        </div>
    }
}
