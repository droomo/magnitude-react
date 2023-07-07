import React from 'react';
import {CircleI, CircleIPair} from './KonvaPatch';
import Konva from "konva";
import classes from './numberSense.module.scss'
import {InputNumber, Form, Button, Row, Col, message, Table} from 'antd';
import axios from "axios";
import {API} from "../const";

// 屏幕物理尺寸 mm
// 屏幕分辨率 pixel

// 笔记本屏幕参数
// const [widthMM, heightMM] = [343, 215]
// const [widthPX, heightPX] = [1536, 960]

// // Screen 2
// const [widthMM, heightMM] = [597.7, 336.2]
// const [widthPX, heightPX] = [2560, 1440]

// 实验室显示器
export const [widthMM, heightMM] = [550, 346]
export const [widthPX, heightPX] = [1920, 1200]

export const calculateCurrentPixel = (px: number) => {
    // Magic numbers originate from the literature
    return px * ((widthPX / widthMM + heightPX / heightMM) / 2) * ((338 / 1280 + 270 / 1024) / 2)
}

const toFixed4 = (n: number) => {
    return Math.round(n * 10000) / 10000
}

export const expStageSize = 240

export const canvas = {
    width: calculateCurrentPixel(expStageSize),
    height: calculateCurrentPixel(expStageSize),
}

export const R = calculateCurrentPixel(10)


interface DataTypeCircleI {
    x: number
    y: number
    radius: number
    direction: number
}

export interface DataTypeContent {
    circle: DataTypeCircleI[]
    circlePaired: DataTypeCircleI[]
}

export interface DataTypeStage {
    id: number,
    circle_paired_number: number,
    circle_number: number,
    content: DataTypeContent
}

export const page_data_number_sense: {
    api_url_save_stage: string,
    api_stage_count: string,
    api_json_stage_detail: string,
    csrf_token: string,
} =
    // @ts-ignore
    JSON.parse(document.getElementById('page_data').innerText)

class StimuliGenerator2 extends React.Component<any, {
    spacingRatio: number
    circleNumber: number
    circlePairedNumber: number
    countTable: Object[]
}> {
    private stage: Konva.Stage | null;
    private layer: Konva.Layer | null

    constructor(props: never) {
        super(props);
        this.stage = null
        this.layer = null;

        this.state = {
            spacingRatio: 2,
            circleNumber: 12,
            circlePairedNumber: 0,
            countTable: []
        }
    }

    componentDidMount() {
        this.stage = new Konva.Stage({
            container: 'canvasContainer',
            ...canvas,
        });

        const layer = new Konva.Layer();
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            fill: 'rgb(127,127,127)'
        });
        layer.add(bg);
        this.stage.add(layer);

        this.reRenderCanvas()
        this.loadCountTableData()
    }

    loadCountTableData() {
        axios.get(page_data_number_sense.api_stage_count).then(resp => {
            return resp.data
        }).then(result => {
            if (result.status === 200) {
                this.setState({
                    countTable: result.data.map((item: any) => {
                        return Object.assign({
                            key: '' + item.circle_paired_number + item.circle_number
                        }, item)
                    })
                })
            } else {
                message.error('error happened while fetching table data')
            }
        }).catch(() => {
            message.error('network failed')
        })
    }

    reRenderCanvas() {
        if (this.stage === null) return
        if (this.layer !== null) {
            this.layer.remove()
        }

        this.layer = new Konva.Layer()
        this.stage.add(this.layer)

        for (let i = 0; i < this.state.circleNumber - this.state.circlePairedNumber * 2;) {
            while (1) {
                let fail = false

                let [x, y] = [
                    Math.random() * (canvas.width - R * 6) + R * 3,
                    Math.random() * (canvas.height - R * 6) + R * 3
                ]
                for (const c of this.stage.find('CircleI')) {
                    const [a, b] = [x - c.x(), y - c.y()]
                    if (Math.sqrt(a * a + b * b) < R * this.state.spacingRatio) {
                        fail = true
                        break
                    }
                }
                if (!fail) {
                    const circleI = new CircleI({
                        x: x,
                        y: y,
                        radius: R,
                        rotation: Math.random() * 360,
                        fill: 'black',
                        draggable: true,
                    });
                    this.layer.add(circleI);
                    i++
                    break
                }
            }
        }

        for (let i = 0; i < this.state.circlePairedNumber;) {
            while (1) {
                let fail = false

                let [x, y] = [
                    Math.random() * (canvas.width - R * 6) + R * 3,
                    Math.random() * (canvas.height - R * 6) + R * 3
                ]
                for (const c of [...this.stage.find('CircleI'), ...this.stage.find('CircleIPair')]) {
                    const [a, b] = [x - c.x(), y - c.y()]
                    if (Math.sqrt(a * a + b * b) < R * this.state.spacingRatio) {
                        fail = true
                        break
                    }
                }
                if (!fail) {
                    const circleIPair = new CircleIPair({
                        x: x,
                        y: y,
                        radius: R,
                        direction: Math.random() * 2 * Math.PI,
                        fill: 'black',
                        draggable: true,
                    });
                    this.layer.add(circleIPair);
                    i++
                    break
                }
            }
        }
    }

    render() {
        return (
            <Row className={classes.page}>
                <Col span={12}>
                    <div className={classes.container}>
                        <div className={classes.canvasContainer} id="canvasContainer"/>

                        <div className={classes.control}>
                            <p>You may drag the circles above.</p>
                            <Form
                                layout="vertical"
                                onFinish={(values) => {
                                    const scaleUnit = calculateCurrentPixel(1)

                                    const content = {
                                        circle: this.stage?.find('CircleI').map((c) => {
                                            return {
                                                x: toFixed4(c.x() / scaleUnit),
                                                y: toFixed4(c.y() / scaleUnit),
                                                radius: toFixed4(c.attrs.radius / scaleUnit),
                                                direction: toFixed4(c.rotation() / 360 * 2 * Math.PI)
                                            }
                                        }),
                                        circlePaired: this.stage?.find('CircleIPair').map((c) => {
                                            return {
                                                x: toFixed4(c.x() / scaleUnit),
                                                y: toFixed4(c.y() / scaleUnit),
                                                radius: toFixed4(c.attrs.radius / scaleUnit),
                                                direction: toFixed4(c.attrs.direction)
                                            }
                                        }),
                                    }

                                    axios.post(API.base_url + page_data_number_sense.api_url_save_stage,
                                        Object.assign(values, {
                                            content: content
                                        }),
                                        {headers: {"X-CSRFToken": page_data_number_sense.csrf_token}}
                                    ).then(resp => {
                                        return resp.data
                                    }).then(result => {
                                        if (result.status === 200) {
                                            message.success(`Saved canvas. ID(${result.data.pk})`)
                                            this.reRenderCanvas()
                                            this.loadCountTableData()
                                        } else {
                                            message.error(result.message)
                                        }
                                    }).catch(() => {
                                        message.error('network failed')
                                    })
                                }}
                                // onFinishFailed={onFinishFailed}
                                autoComplete="off"
                            >
                                <Form.Item label="Minimum distance(times radius)" rules={[{required: true}]}>
                                    <InputNumber<number>
                                        style={{width: 200}}
                                        defaultValue={this.state.spacingRatio}
                                        min={0}
                                        max={4}
                                        step={0.1}
                                        onChange={(value) => {
                                            if (value !== null) {
                                                this.setState({
                                                    spacingRatio: value
                                                }, () => {
                                                    this.reRenderCanvas()
                                                })
                                            }
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item name='circle_number' label="Number of circles" rules={[{required: true}]}
                                           initialValue={this.state.circleNumber}>
                                    <InputNumber<number>
                                        style={{width: 200}}
                                        min={9}
                                        max={15}
                                        step={1}
                                        onChange={(value) => {
                                            if (value !== null) {
                                                this.setState({
                                                    circleNumber: value
                                                }, () => {
                                                    this.reRenderCanvas()
                                                })
                                            }
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item name='circle_paired_number' label="Number of IC pairs"
                                           rules={[{required: true}]}
                                           initialValue={this.state.circlePairedNumber}>
                                    <InputNumber<number>
                                        style={{width: 200}}
                                        min={0}
                                        max={4}
                                        step={2}
                                        onChange={(value) => {
                                            if (value !== null) {
                                                this.setState({
                                                    circlePairedNumber: value
                                                }, () => {
                                                    this.reRenderCanvas()
                                                })
                                            }
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button onClick={() => {
                                        this.reRenderCanvas()
                                    }}>Re-render the canvas</Button>
                                </Form.Item>

                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Submit
                                    </Button>
                                </Form.Item>
                            </Form>

                        </div>
                    </div>
                </Col>
                <Col span={12}>
                    <Table
                        size={'small'}
                        pagination={false}
                        dataSource={this.state.countTable}
                        columns={[
                            {
                                title: 'IC pairs',
                                dataIndex: 'circle_paired_number',
                                key: 'circle_paired_number',
                            },
                            {
                                title: 'Circles',
                                dataIndex: 'circle_number',
                                key: 'circle_number',
                            },
                            {
                                title: 'Count',
                                dataIndex: 'count',
                                key: 'count',
                            },
                        ]}/>
                </Col>
            </Row>
        );
    }
}

export default StimuliGenerator2;
