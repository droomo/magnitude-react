import React from 'react';
import {CircleI, CircleIPair} from './KonvaPatch';
import Konva from "konva";
import classes from './numberSense.module.scss'
import './style.css'
import {Button, message, Table, Typography, Space, Modal, Switch, Form} from 'antd';
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
    activeData: DataTypeStage | undefined
    activeRow: number | undefined
    autoImaging: boolean
}> {
    private stage: Konva.Stage | null;
    private buttonNext: React.RefObject<HTMLButtonElement>;
    private buttonSaveImage: React.RefObject<HTMLButtonElement>;

    constructor(props: never) {
        super(props);
        this.stage = null

        this.state = {
            pagination: {
                current: undefined,
                pageSize: undefined,
                total: undefined,
            },
            activeData: undefined,
            activeRow: undefined,
            loading: true,
            circleNumber: 12,
            circlePairedNumber: 0,
            countTable: [],
            autoImaging: false
        }

        this.buttonNext = React.createRef()
        this.buttonSaveImage = React.createRef()
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
            activeData: undefined,
            activeRow: undefined
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
            <div className={classes.viewerPage}>
                <div className={classes.tableWrapper}>
                    <Table
                        rowClassName={(record, index) => {
                            return index === this.state.activeRow ? 'table-row-active' : ''
                        }}
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
                                render: (content, data, index) => {
                                    return <Space wrap>
                                        <Button
                                            size='small'
                                            type='primary'
                                            onClick={() => {
                                                this.setState({
                                                    activeData: data,
                                                    activeRow: index
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
                </div>
                <div className={classes.fixedWrapper}>
                    {this.state.activeData && <div className={classes.viewerContainer}>
                        <div>
                            <Space wrap direction='vertical'>
                                <h3>渲染图 ID: {this.state.activeData?.id}</h3>

                                <div className={classes.canvasContainer} id="canvasContainer"/>
                                <Space wrap direction='vertical'>
                                    <Button
                                        ref={this.buttonNext}
                                        onClick={() => {
                                            if (this.state.activeData) {
                                                let i = 0
                                                for (i = 0; i < this.state.countTable.length; i++) {
                                                    if (this.state.countTable[i].id === this.state.activeData.id) {
                                                        i++
                                                        break
                                                    }
                                                }
                                                if (i === this.state.countTable.length) {
                                                    message.error('reached last row')
                                                } else {
                                                    this.setState({
                                                        activeData: this.state.countTable[i],
                                                        activeRow: i
                                                    }, () => {
                                                        this.stage = drawStage(expStageSize, 'canvasContainer', this.state.countTable[i].content, true)

                                                        if (this.state.autoImaging) {
                                                            setTimeout(() => {
                                                                this.buttonSaveImage.current?.click()
                                                            }, 20)
                                                        }
                                                    })
                                                }
                                            }
                                        }}
                                    >下一个</Button>
                                    <Form.Item label="Auto generating" rules={[{required: true}]}>
                                        <Switch
                                            checkedChildren="Active" unCheckedChildren="Disabled"
                                            onChange={(active) => {
                                                this.setState({
                                                    autoImaging: active
                                                })
                                            }}
                                        />
                                    </Form.Item>
                                </Space>
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
                                                        activeData: data.stage
                                                    })
                                                    this.loadCountTableData(this.state.pagination.current, this.state.pagination.pageSize, true)
                                                }, {}, this.state.activeData?.id)
                                            }

                                        }}
                                    >保存修改</Button>
                                    <Button
                                        ref={this.buttonSaveImage}
                                        onClick={() => {
                                            axios.post(page_data_number_sense.api_url_save_stage + this.state.activeData?.id, {
                                                image: this.stage?.toDataURL({pixelRatio: 10})
                                            }, {
                                                headers: {"X-CSRFToken": page_data_number_sense.csrf_token}
                                            }).then((resp) => {
                                                return resp.data
                                            }).then((data) => {
                                                if (data.status === 200) {
                                                    message.success('成功')
                                                    this.setState({
                                                        activeData: data.data.stage
                                                    }, () => {
                                                        this.loadCountTableData(this.state.pagination.current, this.state.pagination.pageSize, true)

                                                        if (this.state.autoImaging) {
                                                            setTimeout(() => {
                                                                this.buttonNext.current?.click()
                                                            }, 500)
                                                        }
                                                    })
                                                }
                                            })
                                        }}
                                    >（重新）生成静态图</Button>
                                </Space>
                                <div className={classes.canvasContainer}>
                                    {this.state.activeData?.img_file ?
                                        (() => {
                                            const url = this.state.activeData?.img_file + '?_t=' + Date.now()
                                            return <a href={url} target="_blank" rel="noreferrer">
                                                <img
                                                    src={url}
                                                    className={classes.imgViewer}
                                                    alt={'' + this.state.activeData?.id}
                                                />
                                            </a>
                                        })()
                                        : <Text type='danger'>未生成图片</Text>
                                    }
                                </div>
                            </Space>
                        </div>
                    </div>}
                </div>
            </div>
        );
    }
}

export default StimuliViewer;
