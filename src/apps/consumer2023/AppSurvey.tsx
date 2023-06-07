import React from 'react';
import {Model} from 'survey-core';
import "survey-core/survey.i18n";
import {Survey} from 'survey-react-ui';
// import "survey-core/defaultV2.css";
import 'survey-core/modern.min.css';
import './surveyApp.css'
import axios from "axios";

const controlVariable = [
    "我羡慕那些拥有昂贵的房子、汽车和衣服的人。",
    "我喜欢在很多不同的东西上花钱。",
    "如果我拥有很多我没有的东西，我的生活会更好。",
    "买东西给我很多乐趣。",
    "如果我能买得起更多的东西，我会更快乐。",
    "我喜欢拥有给人留下深刻印象的东西。",
    "我生活中喜欢很多奢侈品。",
    "我不从我知道使用血汗工厂、童工或其他恶劣工作条件的公司购买产品。",
    "当有更便宜的替代品时，我会花更多的钱买环保产品当有更便宜的替代品时，我会花更多的钱购买对社会负责的产品。",
    "令我烦恼的是，我买不起所有我喜欢的东西。",
    "生活中一些最重要的成就包括获得物质财富。",
]


const shopping = [
    [
        {
            imageName: '星巴克',
            title: '星巴克椰椰双打冷萃',
            price: '39',
            question: '如果专注于追求意义，你更愿意买哪款咖啡？'
        },
        {
            imageName: '瑞幸',
            title: '瑞幸生椰拿铁',
            price: '18.5',
        }
    ],
    [
        {
            imageName: '九号电动车',
            title: '九号长续航升级版',
            price: '5999',
            question: '如果专注于追求意义，你更想买哪款交通工具？'
        },
        {
            imageName: '凤凰自行车',
            title: '凤凰通勤自行车',
            price: '420',
        }
    ],
    [
        {
            imageName: '雅诗兰黛',
            title: '雅诗兰黛精华液',
            price: '1299',
            question: '如果专注于追求意义，你更愿意买？'
        },
        {
            imageName: '大宝',
            title: '大宝SPD蜜',
            price: '18',
        }
    ],
    [
        {
            imageName: '阿迪达斯',
            title: '阿迪达斯三叶草长裤',
            price: '559',
            question: '如果专注于追求意义，你更愿意买哪款裤子？'
        },
        {
            imageName: '迪卡侬',
            title: '迪卡侬休闲裤',
            price: '99',
        }
    ],
    [
        {
            imageName: '米其林',
            title: '米其林三星餐厅',
            price: '520',
            question: '如果专注于追求意义，你更愿意吃？'
        },
        {
            imageName: '家常菜',
            title: '路边大排档的家常菜',
            price: '36',
        }
    ],
    [
        {
            imageName: '全画幅相机',
            title: '高端全画幅微单相机',
            price: '12800',
            question: '如果专注于追求意义，你更愿意买哪款相机？'
        },
        {
            imageName: '卡片相机',
            title: '入门级卡片数码相机',
            price: '799',
        }
    ],
]

const surveyJson = {
    showQuestionNumbers: false,
    pages: [
        {
            title: '意义追寻与消费动机调查',
            elements: [
                {
                    type: 'html',
                    html: `<div>
            <div>
                <p>亲爱的朋友：</p>
                <p>您好！</p>
                <p>这里是北京大学【消费心理专题】课程关于【追求意义与消费动机】的调查。</p>
                <p>完成本次问卷大约需要三分钟，您的参与和如实作答对我们非常重要！</p>
                <p>问卷采用匿名调查的方式，采集到的数据仅作课程报告之用，因此请您按照自己的真实情况作答。</p>
                <p>非常感谢您的参与！🌹🌹🌹</p>
            </div>
            <footer class="intro-footer">课程小组作业</footer>
        </div>`
                }
            ]
        },
        {
            title: '观念调查',
            elements: [
                {
                    type: 'html',
                    name: "info",
                    html: ` <div><p><strong style="color:#2690fe;">总体上</strong>，请评价你在多大程度上同意下列观点</p></div>`
                },
                ...controlVariable.map((question, index) => {
                    return {
                        "type": "rating",
                        "name": `control${index}`,
                        "title": question,
                        "description": "笑脸表示更加同意，哭脸表示更加反对",
                        "rateType": "smileys",
                        "rateCount": 7,
                        "rateMax": 7,
                        isRequired: true,
                        "displayMode": "buttons"
                    }
                })
            ]
        },
        {
            elements: [
                {
                    "type": "comment",
                    "name": "what_is_meaning",
                    "title": "为了帮助您进入状态，请您用一到两分钟时间描述一下主要由对意义的渴望驱动的选择意味着什么。请如实写下来。",
                    // "description": "",
                    "rows": 10,
                    "autoGrow": true,
                    "allowResize": false,
                    isRequired: true,
                }
            ]
        },
        {
            title: '购买意愿调查',
            elements: [
                {
                    type: 'html',
                    html: ` <div>
 <p style="line-height: 1.5">当您做出以下选择时，<strong style="color:#2690fe;">请专注于从你的选择中获得意义。</strong>也就是说，专注于每个选择中你认为最有目的、最有成就感和最有价值的方面。试着让它成为一次有意义的经历！</p>
 <p style="line-height: 1.5">同时，请您设想以下选择都是<strong style="color:#2690fe;">以您的真实经济水平</strong>，在<strong style="color:#2690fe;">您的生活中真实发生的</strong>。</p>
</div>`
                },
                ...shopping.flatMap((item, index) => {
                    return [
                        {
                            type: 'html',
                            html: `<div class="shopping">
 <div class="part">
    <img src="https://source.droomo.top/psy/consumer2023/assets/${item[0].imageName}.png" alt="${item[0].imageName}" width="90%" />
    <div>${item[0].title}</div>
    <span class="price"><span>￥</span><strong>${item[0].price}</strong></span>
 </div>
 <div class="part">
    <img src="https://source.droomo.top/psy/consumer2023/assets/${item[1].imageName}.png" alt="${item[1].imageName}"  width="90%" />
    <div>${item[1].title}</div>
    <span class="price"><span>￥</span><strong>${item[1].price}</strong></span>
 </div>
</div>`
                        },
                        {
                            "type": "rating",
                            "name": `shopping${index}`,
                            "title": item[0].question,
                            "description": `低分倾向于${item[0].imageName}，高分倾向于${item[1].imageName}`,
                            "autoGenerate": false,
                            "rateValues": [1, 2, 3, 4, 5, 6],
                            isRequired: true,
                        },
                        {
                            type: 'html',
                            html: ``
                        }
                    ]
                }),
            ]
        },
        {
            title: '机会成本考量调查',
            elements: [
                {
                    "name": "opportunity_costs",
                    "type": "rating",
                    "title": "您在上一页选择商品的过程中，多大程度上考虑了金钱的机会成本？",
                    "description": "即，您在多大程度上考虑过，选择便宜的商品是因为在生活中需要节省下来钱，去买更有用的东西。",
                    "rateCount": 10,
                    "rateValues": [ 1, 2, 3, 4, 5, 6, 7,],
                    isRequired: true,
                },
            ]
        },
        {
            title: '基本信息填写',
            elements: [
                {
                    type: 'html',
                    html: `<p>这些数据仅用于做群体水平的处理，并且严格保证绝不泄露信息。</p>`
                },
                {
                    "name": "age",
                    "type": "text",
                    "title": "请输入您的年龄",
                    "inputType": "number",
                    "min": 6,
                    "max": 100,
                    "step": 1,
                    isRequired: true,
                },
                {
                    "type": "radiogroup",
                    "name": "gender",
                    "title": "请选择您的性别",
                    "colCount": 1,
                    "choices": ["男", "女"],
                    "separateSpecialChoices": true,
                    isRequired: true,
                }
            ]
        }
    ]
};

function AppSurvey() {

    const survey = new Model(surveyJson);

    survey.locale = 'zh-cn';

    survey.completedHtml = '<div>感谢参与，请完成后续实验。</div>';
    survey.currentPage = 2

    survey.onComplete.add(function (sender, options) {
        options.showSaveInProgress();
        axios.post(
            '',
            // API.submit_before,
            {
                question: surveyJson,
                answer: sender.data,
            }
        ).then(resp => {
            return resp.data
        }).then(data => {
            if (data.status === 200) {
                options.showSaveSuccess();
            } else {
                options.showSaveError("储存过程错误");
            }
        }).catch(() => {
            options.showSaveError('网络错误，请联系主试。')
        })
    })

    return <Survey model={survey}/>
}

export default AppSurvey;
