import React from 'react';
import {CircleI, CircleIPair} from './KonvaPatch';
import Konva from "konva";
import classes from './numberSense.module.scss'
import {InputNumber, Form} from 'antd';


// 笔记本屏幕参数
// const [widthMM, heightMM] = [343, 215]
// const [widthPX, heightPX] = [1536, 960]

// Screen 2
// 屏幕物理尺寸 mm
const [widthMM, heightMM] = [597.7, 336.2]
// 屏幕分辨率 pixel
const [widthPX, heightPX] = [2560, 1440]

const calculateCurrentPixel = (px: number) => {
    // Magic numbers originate from the literature
    return px * ((widthPX / widthMM + heightPX / heightMM) / 2) * ((338 / 1280 + 270 / 1024) / 2)
}

const canvas = {
    width: calculateCurrentPixel(240),
    height: calculateCurrentPixel(240),
}

const R = calculateCurrentPixel(10)

class StimuliGenerator2 extends React.Component<any, {
    spacingRatio: number
    circleNumber: number
    circlePairedNumber: number
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
            circlePairedNumber: 0
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
            <div className={classes.container}>
                <div className={classes.canvasContainer} id="canvasContainer"/>

                <div className={classes.control}>
                    <p>You may drag the circles above.</p>
                    <Form
                        // form={form}
                        layout="vertical"
                        // onFinish={onFinish}
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

                        <Form.Item name='circle_number' label="Number of circles" rules={[{required: true}]} initialValue={this.state.circleNumber}>
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

                        <Form.Item name='circle_paired_number' label="Number IC pairs" rules={[{required: true}]} initialValue={this.state.circlePairedNumber}>
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

                    </Form>

                </div>
            </div>
        );
    }
}

export default StimuliGenerator2;
