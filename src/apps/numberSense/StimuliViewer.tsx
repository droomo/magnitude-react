import React from 'react';
import {CircleI, CircleIPair} from './KonvaPatch';
import Konva from "konva";
import classes from './numberSense.module.scss'
import {Button, Row, Col, message, Table, Typography, Space, Modal} from 'antd';
import axios from "axios";

import {
    calculateCurrentPixel,
    canvas, DataTypeContent,
    DataTypeStage,
    expStageSize,
    page_data_number_sense,
} from "./StimuliGenerator2";

const {Text} = Typography;

const drawStage = (stageSize: number, elementID: string, content: DataTypeContent, draggable?: boolean) => {
    const stageRatio = stageSize / expStageSize
    const stage = new Konva.Stage({
        container: elementID,
        width: calculateCurrentPixel(stageSize),
        height: calculateCurrentPixel(stageSize),
    });
    const layer = new Konva.Layer()
    stage.add(layer)

    const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: canvas.width,
        height: canvas.height,
        fill: 'rgb(127,127,127)'
    });
    layer.add(bg)

    for (const c of content.circle) {
        const circleI = new CircleI({
            x: c.x * stageRatio,
            y: c.y * stageRatio,
            radius: c.radius * stageRatio,
            rotation: c.direction / 2 / Math.PI * 360,
            fill: 'black',
            draggable: draggable === true
        });
        layer.add(circleI);
    }
    for (const c of content.circlePaired) {
        const circleIPair = new CircleIPair({
            x: c.x * stageRatio,
            y: c.y * stageRatio,
            radius: c.radius * stageRatio,
            direction: c.direction,
            fill: 'black',
            draggable: draggable === true
        });
        layer.add(circleIPair);
    }
}

class StimuliViewer extends React.Component<any, {
    pagination: {
        current: number | undefined,
        pageSize: number | undefined,
        total: number | undefined,
    }
    loading: boolean
    circleNumber: number
    circlePairedNumber: number
    countTable: DataTypeStage[]
    previewingData: DataTypeStage | undefined
}> {
    constructor(props: never) {
        super(props);

        this.state = {
            pagination: {
                current: undefined,
                pageSize: undefined,
                total: undefined,
            },
            previewingData: undefined,
            loading: true,
            circleNumber: 12,
            circlePairedNumber: 0,
            countTable: []
        }
    }

    componentDidMount() {
        this.loadCountTableData()
    }

    loadCountTableData(current?: number, size?: number) {
        this.cleanCanvas()

        this.setState({
            loading: true
        })
        axios.get(page_data_number_sense.api_json_stage_detail, {
            params: {
                size: size,
                current: current,
            }
        }).then(resp => {
            return resp.data
        }).then(result => {
            if (result.status === 200) {
                return result.data
            } else {
                message.error('error happened while fetching table data')
            }
        }).then((data) => {
            this.setState({
                countTable: data.list.map((item: any) => {
                    return Object.assign({
                        key: item.id
                    }, item)
                }),
                pagination: {...data.page},
                loading: false
            }, () => {
                for (const stageData of this.state.countTable) {
                    drawStage(50, `stage_preview_${stageData.id}`, stageData.content)
                }
            })
        }).catch(() => {
            message.error('network failed')
        })
    }

    cleanCanvas() {
        this.setState({
            previewingData: undefined
        })

        if (document.getElementById('canvasContainer') === null) return;

        const stage = new Konva.Stage({
            container: 'canvasContainer',
            ...canvas,
        })

        if (stage === null) return

        const layer = new Konva.Layer();
        const bg = new Konva.Rect({
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height,
            fill: 'rgb(127,127,127)'
        });
        layer.add(bg);
        const text = new Konva.Text({
            x: canvas.width / 2 - 40,
            y: canvas.height / 2 - 10,
            text: 'No preview',
            fontSize: 20,
            // fill: 'green'
        })
        layer.add(text);
        stage.add(layer);
    }

    render() {
        return (
            <Row className={classes.viewerPage}>
                <Col span={18}>
                    <Table
                        loading={this.state.loading}
                        size={'small'}
                        pagination={this.state.pagination}
                        dataSource={this.state.countTable}
                        onChange={(pager) => {
                            this.loadCountTableData(pager.current, pager.pageSize)
                        }}
                        columns={[
                            {
                                title: 'ID',
                                dataIndex: 'id',
                                key: 'id',
                            },
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
                                title: 'Preview',
                                dataIndex: 'id',
                                key: 'preview',
                                render: (id: number) => {
                                    return <span id={`stage_preview_${id}`}>Preview-{id}</span>
                                }
                            },
                            {
                                title: 'Action',
                                dataIndex: 'content',
                                key: 'action',
                                render: (content, data) => {
                                    return <Space wrap>
                                        <Button
                                            size='small'
                                            type='primary'
                                            onClick={() => {
                                                this.setState({
                                                    previewingData: data
                                                }, () => {
                                                    drawStage(240, 'canvasContainer', content, true)
                                                })
                                            }}
                                        >预览</Button>
                                        <Button
                                            size='small'
                                            danger
                                            onClick={() => {
                                                Modal.confirm({
                                                    title: 'Confirm',
                                                    content: <span>删除图片<Text mark strong>{`ID[${data.id}]`}</Text>？</span>,
                                                    okText: '确认',
                                                    cancelText: '取消',
                                                    onOk: () => {
                                                        axios.delete(page_data_number_sense.api_url_save_stage + data.id, {
                                                            headers: {"X-CSRFToken": page_data_number_sense.csrf_token}
                                                        }).then((resp) => {
                                                            if (resp.status === 204) {
                                                                message.success('删除成功')
                                                            }
                                                            this.loadCountTableData(this.state.pagination.current, this.state.pagination.pageSize)
                                                        })
                                                    }
                                                });
                                            }}
                                        >删除</Button>
                                    </Space>
                                }
                            }
                        ]}/>
                </Col>
                <Col span={6}>
                    {this.state.previewingData && <div className={classes.container}>
                        <div>
                            <h3>数据渲染图</h3>
                            <div className={classes.canvasContainer} id="canvasContainer"/>
                            <div>
                                <Text strong>ID: {this.state.previewingData?.id}</Text>
                            </div>
                        </div>
                        <div>
                            <h3>生成图</h3>
                            <div className={classes.canvasContainer} id="canvasContainer"/>
                        </div>
                    </div>}
                </Col>
            </Row>
        );
    }
}

export default StimuliViewer;
