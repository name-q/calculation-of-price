import React, { useState, useRef } from 'react'

import { Button, Affix, Alert, Tooltip, BackTop, message } from 'antd'
import ReactJson from 'react-json-view'

import { calculateOrder } from '../../util/price'

export default function Price() {
    //总数据
    let [data, setdata] = useState({})

    //分数据组件
    let params = useRef([])
    const DivisionData = (text, param) => {
        let [click, setClick] = useState(false)

        return (
            <>
                <Line>
                    <Button size={'large'} onClick={
                        () => {
                            //此条数据初始化装载
                            if (!click && param) params.current.push(param)
                            //显示分数据
                            setClick(true)
                            //带入计算
                            setdata(calculateOrder(params.current))
                            /**返回值
                             * @return{
                                    //剩余应付价格 | 总价 | 应付款
                                    totalPrice,
                                    //格式化后的 剩余应付价格 | 总价 | 应付款
                                    formatPrice,
                                    //优惠券包 [  {...{传入的有价值优惠券数据},use:true-被使用 | false-未使用,couponBalance:使用后的余量（公司现未使用该字段） }  ]
                                    coupon,
                                    //比例抵扣包 [  {...{传入的抵扣包数据},proportionBalance:余额}  ]
                                    deduct,
                                    //传入的数据
                                    INCOMINGDATA,
                                }
                            */
                        }
                    }>
                        + {text.split('  ')[0]}
                    </Button>
                    {Al(text)}
                </Line>
                {click && param && Al(JSON.stringify(param), 2)}
            </>
        )
    }

    //入参与入参说明
    return (
        <div style={content}>
            <BackTop style={{ left: 5 }} />
            <Affix>
                {Al(`return ${JSON.stringify(data)}`, 4, { margin: 0, minHeight: 100 })}
                <ReactJson
                    style={{ backgroundColor: '#ffccc7', maxHeight: 200, overflow: 'auto', padding: '0 10px 3px' }}
                    iconStyle="circle"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    collapsed
                    name={null}
                    enableClipboard={handleCopy}
                    src={data}
                />
            </Affix>

            {/* 团购直接修改入参价格为团购 后端判断拼团成功则下单成功失败则撤单 */}
            {DivisionData('商品A X1  单价￥100 隶属商家A', { skuid: 'skuidA', num: 1, price: 100, businessid: 'businessA' })}
            {DivisionData('商品A X1  单价￥100 隶属商家A', { skuid: 'skuidA', num: 1, price: 100, businessid: 'businessA' })}
            {DivisionData('商品B X2  单价￥20 隶属商家A', { skuid: 'skuidB', num: 2, price: 20, businessid: 'businessA' })}
            {DivisionData('商品C X3  单价￥30 隶属商家C', { skuid: 'skuidB', num: 3, price: 30, businessid: 'businessC' })}
            <br />

            {/* 只有优惠券辐射商品 或辐射商家商品 或辐射全部商品 没有商品限制优惠券且优惠券同类型的只能用一张（店铺|平台）故优惠券没有数量参数 */}
            {DivisionData('优惠券A     面额20 仅商家A的商品A可用', { couponid: 'couponA', price: 20, limitBusiness: ['businessA'], limitSku: ['skuidA'] })}
            {DivisionData('优惠券B     面额10 仅商家A商品可用', { couponid: 'couponB', price: 10, limitBusiness: ['businessA'] })}
            {DivisionData('优惠券C     面额200 所有商品都可用', { couponid: 'couponC', price: 200 })}
            <br />

            {/* 传入先后与优先级成正比 */}
            {/* 商品可以限制积分抵扣比例 */}
            {DivisionData('积分抵扣      总积分200000 积分/金额抵扣比例 100：1', { name: '积分抵扣', proportionid: 'integral', price: 200000, proportionValue: 100 })}
            <br />

            {/* 观察与积分抵扣入参的区别 有类似银行卡抵扣 VIP抵扣参照修改入参即可 */}
            {DivisionData('余额抵扣      总余额100 积分/金额抵扣比例 1:1', { name: '余额抵扣', proportionid: 'balance', price: 100, proportionValue: 1 })}
            <br />

            {/* 参照余额抵扣入参的区别 有类似银行卡抵扣 xxx抵扣修改入参即可 */}
            {DivisionData('VIP积分抵扣      总积分500 积分/金额抵扣比例 50:1', { name: 'VIP积分抵扣', proportionid: 'VIPintegral', price: 500, proportionValue: 50 })}
            <br />

        </div>
    )


}

const Al = (text, level = 1, style) => (
    <Alert
        style={{ flex: 1, marginLeft: 10, ...style }}
        message={text}
        type={level === 1
            ? 'success'
            : level === 2
                ? 'info'
                : level === 3
                    ? 'warning'
                    : 'error'}
    />
)

const Line = (props) => (<div style={fuckingLineStyle}>{props.children}</div>)

const handleCopy = (copy) => {
    console.log(copy)
    message.success('copy success 🐒')
}







const content = { flex: 1, backgroundImage: 'linear-gradient(to top, #ebedee 0%, #dcdddf 52%, #eee 100%)', margin: 50, padding: 50 }
const fuckingLineStyle = { flex: 1, display: 'flex', flexWrap: 'wrap', margin: '50px 0 10px', alignItems: 'center' }
