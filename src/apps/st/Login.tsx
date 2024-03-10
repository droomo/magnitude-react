import React from 'react';
import axios from 'axios';
import {Form, Input, Button, Select, InputNumber, message, Row, Col} from 'antd';
import {UserOutlined, PhoneOutlined} from '@ant-design/icons';
import {api_subject, getCsrfToken} from "../const";
import {useNavigate} from "react-router-dom";


interface SubjectFormValues {
    name: string;
    age: number;
    code: string;
    tel?: string;
    gender: 'M' | 'F' | 'U';
    note?: string;
}


const SubjectForm: React.FC = () => {
    const [form] = Form.useForm();

    const navigate = useNavigate();

    const onFinish = (values: SubjectFormValues) => {
        axios.post(api_subject, values, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        })
            .then((resp) => {
                if (resp.data.user) {
                    localStorage.setItem('username', values.name);
                    navigate('/st/intro/');
                } else {
                    alert('error');
                }
            })
            .catch(error => {
                message.error('Submission failed: ' + error.message);
            });
    };

    const onCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.toUpperCase();
        form.setFieldsValue({code: newValue});
        axios.get(`${api_subject}?code=${newValue}`).then(response => {
            if (response.data.subject) {
                form.setFieldsValue(response.data.subject);
            } else {
                form.resetFields(Object.keys(form.getFieldsValue()).filter(key => key !== 'code'));
            }
        });
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#ffffff'
        }}>
            <Row justify="center" style={{width: '100vw', marginTop: '-20px'}}>
                <Col xs={24} sm={16} md={14} lg={10} xl={7}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                    >
                        <Form.Item
                            name="code"
                            label="学号或证件号"
                            rules={[{required: true, message: 'Please input the code!'}]}
                        >
                            <Input
                                placeholder="Student code or your ID"
                                onChange={onCodeChange}
                            />
                        </Form.Item>

                        <Form.Item
                            name="name"
                            label="姓名"
                            rules={[{required: true, message: 'Please input the subject name!'}]}
                        >
                            <Input prefix={<UserOutlined/>} placeholder="Name"/>
                        </Form.Item>

                        <Form.Item
                            name="age"
                            label="年龄"
                            rules={[{required: true, message: 'Please input the subject age!'}]}
                        >
                            <InputNumber min={1} max={120} style={{width: '100%'}} placeholder="Age"/>
                        </Form.Item>

                        <Form.Item
                            name="gender"
                            label="性别"
                            rules={[{required: true, message: 'Please select the subject gender!'}]}
                        >
                            <Select placeholder="Select a gender">
                                <Select.Option value="M">Male</Select.Option>
                                <Select.Option value="F">Female</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="tel"
                            label="电话"
                        >
                            <Input prefix={<PhoneOutlined/>} placeholder="Mobile"/>
                        </Form.Item>

                        <Form.Item
                            name="note"
                            label="备注"
                        >
                            <Input.TextArea rows={3} placeholder="备注..."/>
                        </Form.Item>

                        <Form.Item>
                            <Row justify="center">
                                <Col>
                                    <Button type="primary" htmlType="submit">开始实验</Button>
                                </Col>
                            </Row>
                        </Form.Item>
                    </Form>
                </Col>
            </Row>
        </div>
    );
};

export default SubjectForm;
