import React from 'react';
import axios from 'axios';
import {Form, Input, Button, Select, InputNumber, message} from 'antd';
import {UserOutlined, PhoneOutlined} from '@ant-design/icons';
import {API, getCsrfToken, page_data} from "../const";

console.log(API, page_data)

interface SubjectFormValues {
    name: string;
    age: number;
    code?: string;
    tel?: string;
    gender: 'M' | 'F' | 'U';
    note?: string;
}


const SubjectForm: React.FC = () => {
    const [form] = Form.useForm();

    const onFinish = (values: SubjectFormValues) => {
        axios.post(`${API.base_url}${page_data.api_subject_login}`, values, {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCsrfToken(),
            },
        })
            .then(() => {
                message.success('Subject information submitted successfully');
                // form.resetFields();
            })
            .catch(error => {
                message.error('Submission failed: ' + error.message);
            });
    };

    return (
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
                <Input placeholder="Student code or your ID"/>
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
                name="tel"
                label="电话"
            >
                <Input prefix={<PhoneOutlined/>} placeholder="Mobile"/>
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
                name="note"
                label="备注"
            >
                <Input.TextArea rows={4} placeholder="备注..."/>
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit">开始实验</Button>
            </Form.Item>
        </Form>
    );
};

export default SubjectForm;
