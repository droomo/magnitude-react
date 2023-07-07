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
    page_data_number_sense, saveStage,
} from "./StimuliGenerator2";

const {Text} = Typography;

const drawStage = (stageSize: number, elementID: string, content: DataTypeContent, draggable?: boolean) => {
    const scaleUnit = calculateCurrentPixel(1)

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
        width: calculateCurrentPixel(stageSize),
        height: calculateCurrentPixel(stageSize),
        fill: 'rgb(127,127,127)'
    });
    layer.add(bg)

    for (const c of content.circle) {
        const circleI = new CircleI({
            x: c.x * stageRatio * scaleUnit,
            y: c.y * stageRatio * scaleUnit,
            radius: c.radius * stageRatio * scaleUnit,
            rotation: c.direction / 2 / Math.PI * 360,
            fill: 'black',
            draggable: draggable === true
        });
        layer.add(circleI);
    }
    for (const c of content.circlePaired) {
        const circleIPair = new CircleIPair({
            x: c.x * stageRatio * scaleUnit,
            y: c.y * stageRatio * scaleUnit,
            radius: c.radius * stageRatio * scaleUnit,
            direction: c.direction,
            fill: 'black',
            draggable: draggable === true
        });
        layer.add(circleIPair);
    }

    return stage
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
    private stage: Konva.Stage | null;

    constructor(props: never) {
        super(props);
        this.stage = null

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

    loadCountTableData(current?: number, size?: number, stackViewer?: boolean) {
        if (!stackViewer) this.cleanCanvas()

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
                <Col span={12}>
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
                                                    this.stage = drawStage(expStageSize, 'canvasContainer', content, true)
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
                                        {data.img_file ? <Text type='success'>已生成静态图</Text> :
                                            <Text type='danger'>无静态图</Text>}

                                    </Space>
                                }
                            }
                        ]}/>
                </Col>
                <Col span={11} offset={1}>
                    {this.state.previewingData && <div className={classes.container}>
                        <Space wrap direction='vertical'>
                            <h3>渲染图</h3>
                            <Text strong>ID: {this.state.previewingData?.id}</Text>
                            <div className={classes.canvasContainer} id="canvasContainer"/>
                            <Button
                                onClick={() => {
                                    if (this.state.previewingData) {
                                        let i = 0
                                        for (i = 0; i < this.state.countTable.length; i++) {
                                            if (this.state.countTable[i].id === this.state.previewingData.id) {
                                                i++
                                                break
                                            }
                                        }
                                        if (i === this.state.countTable.length) {
                                            message.error('reached last row')
                                        } else {
                                            this.setState({
                                                previewingData: this.state.countTable[i]
                                            }, () => {
                                                this.stage = drawStage(expStageSize, 'canvasContainer', this.state.countTable[i].content, true)
                                            })
                                        }
                                    }
                                }}
                            >下一个</Button>
                        </Space>
                        <br/>
                        <Space wrap direction='vertical'>
                            <h3>静态图</h3>
                            <Space wrap>
                                <Button
                                    onClick={() => {
                                        if (this.stage) {
                                            saveStage(this.stage, (data: any) => {
                                                this.setState({
                                                    previewingData: data.stage
                                                })
                                                this.loadCountTableData(this.state.pagination.current, this.state.pagination.pageSize, true)
                                            }, {}, this.state.previewingData?.id)
                                        }

                                    }}
                                >保存修改</Button>
                                <Button
                                    onClick={() => {
                                        axios.post(page_data_number_sense.api_url_save_stage + this.state.previewingData?.id, {
                                            image: this.stage?.toDataURL({pixelRatio: 10})
                                        }, {
                                            headers: {"X-CSRFToken": page_data_number_sense.csrf_token}
                                        }).then((resp) => {
                                            return resp.data
                                        }).then((data) => {
                                            if (data.status === 200) {
                                                message.success('成功')
                                                this.setState({
                                                    previewingData: data.data.stage
                                                })
                                                this.loadCountTableData(this.state.pagination.current, this.state.pagination.pageSize, true)
                                            }
                                        })
                                    }}
                                >（重新）生成静态图</Button>
                            </Space>
                            <div className={classes.canvasContainer}>
                                {this.state.previewingData?.img_file ?
                                    (() => {
                                        const url = this.state.previewingData?.img_file + '?_t=' + Date.now()
                                        return <a href={url} target="_blank" rel="noreferrer">
                                            <img
                                                src={url}
                                                className={classes.imgViewer}
                                                alt={'' + this.state.previewingData?.id}
                                            />
                                        </a>
                                    })()
                                    : <Text type='danger'>未生成图片</Text>
                                }
                            </div>
                        </Space>
                    </div>}
                </Col>
            </Row>
        );
    }
}

export default StimuliViewer;
