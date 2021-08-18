/**
 * 价格计算共通方法
 */
const { log, warn } = console

/**
 * 计算订单金额
 */

export const calculateOrder = (data) => {
    let INCOMINGDATA = data
    log('>>>>传入数据', data)

    let totalPrice = 0
    warn('***********计算总价***********')
    data.map(i => {
        if (i?.skuid && i?.price && i?.num && i?.businessid) {
            i.goodsTotalPrice = mul(i.price, i.num)
            totalPrice = add(totalPrice, i.goodsTotalPrice)
        }
    })
    log('>>>>载入-商品总额-goodsTotalPrice', data)
    log('总价：', totalPrice)

    warn('***********计算优惠券***********')
    //优惠券包
    let coupon = []
    data.map(item => {
        if (item?.couponid && item?.price) {
            let { price, limitSku, limitBusiness } = item
            //标识优惠券是否使用
            let use = false
            //标识优惠券余额（当前业务场景不需要此字段）
            let couponBalance = price * 1
            /* 1.店铺部分商品可用优惠券 */
            if (limitSku && limitBusiness && limitSku.length && limitBusiness.length) {
                //过滤出商品
                data.map(i => {
                    //优惠券存在余额才继续搜寻符合商品
                    if (couponBalance && i?.skuid && i?.price && i?.num && i?.businessid && i?.goodsTotalPrice && limitSku.includes(i.skuid) && limitBusiness.includes(i.businessid)) {
                        use = true
                        let { goodsTotalPrice } = i
                        goodsTotalPrice = sub(goodsTotalPrice, couponBalance)
                        if (goodsTotalPrice < 0) {
                            //优惠卷价格>商品总额
                            //刷新数据： 总价 优惠券余额 商品总额
                            totalPrice = sub(totalPrice, i.goodsTotalPrice)
                            couponBalance = sub(0, goodsTotalPrice)
                            i.goodsTotalPrice = 0

                        } else {
                            //优惠券价格≤商品总额
                            //刷新数据： 总价 优惠券余额 商品总额
                            totalPrice = sub(totalPrice, couponBalance)
                            couponBalance = 0
                            i.goodsTotalPrice = goodsTotalPrice
                        }
                    }
                })
                log(`>>>>店铺部分商品可用优惠券${item.couponid} ${use ? "已使用" : "未使用"} 余量${couponBalance}`)
                // 加入优惠券包 原优惠券信息 余量          是否使用  
                coupon.push({ ...item, couponBalance, use, })
                /* 2.店铺可用优惠券 */
            } else if (limitBusiness && limitBusiness.length) {
                //过滤出商品
                data.map(i => {
                    //优惠券存在余额才继续搜寻符合商品
                    if (couponBalance && i?.skuid && i?.price && i?.num && i?.businessid && i?.goodsTotalPrice && limitBusiness.includes(i.businessid)) {
                        use = true
                        let { goodsTotalPrice } = i
                        goodsTotalPrice = sub(goodsTotalPrice, couponBalance)
                        if (goodsTotalPrice < 0) {
                            //优惠卷价格>商品总额
                            //刷新数据： 总价 优惠券余额 商品总额
                            totalPrice = sub(totalPrice, i.goodsTotalPrice)
                            couponBalance = sub(0, goodsTotalPrice)
                            i.goodsTotalPrice = 0

                        } else {
                            //优惠券价格≤商品总额
                            //刷新数据： 总价 优惠券余额 商品总额
                            totalPrice = sub(totalPrice, couponBalance)
                            couponBalance = 0
                            i.goodsTotalPrice = goodsTotalPrice
                        }
                    }
                })
                log(`>>>>店铺可用优惠券${item.couponid} ${use ? "已使用" : "未使用"} 余量${couponBalance}`)
                // 加入优惠券包 原优惠券信息 余量          是否使用  
                coupon.push({ ...item, couponBalance, use, })
                /* 3.全平台可用优惠券 */
            } else {
                //过滤出商品
                data.map(i => {
                    //优惠券存在余额才继续搜寻符合商品
                    if (couponBalance && i?.skuid && i?.price && i?.num && i?.businessid && i?.goodsTotalPrice) {
                        use = true
                        let { goodsTotalPrice } = i
                        goodsTotalPrice = sub(goodsTotalPrice, couponBalance)
                        if (goodsTotalPrice < 0) {
                            //优惠卷价格>商品总额
                            //刷新数据： 总价 优惠券余额 商品总额
                            totalPrice = sub(totalPrice, i.goodsTotalPrice)
                            couponBalance = sub(0, goodsTotalPrice)
                            i.goodsTotalPrice = 0

                        } else {
                            //优惠券价格≤商品总额
                            //刷新数据： 总价 优惠券余额 商品总额
                            totalPrice = sub(totalPrice, couponBalance)
                            couponBalance = 0
                            i.goodsTotalPrice = goodsTotalPrice
                        }
                    }
                })
                log(`>>>>全平台可用优惠券${item.couponid} ${use ? "已使用" : "未使用"} 余量${couponBalance}`)
                // 加入优惠券包 原优惠券信息 余量          是否使用  
                coupon.push({ ...item, couponBalance, use, })
            }
        }
    })

    warn('***********计算比例抵扣值 积分 余额 VIP积分 ***********')
    //比例抵扣包
    let deduct = []
    data.map(item => {
        if (item?.name && item?.proportionid && item?.price && item?.proportionValue) {
            let { price, proportionValue } = item
            //抵扣后的余额
            let proportionBalance = 0
            //可被抵扣值 = 总价 * 比例值
            totalPrice = mul(totalPrice, proportionValue)
            log('>>>>可被抵扣值', totalPrice)
            //发起抵扣
            totalPrice = sub(totalPrice, price)
            if (totalPrice < 0) {
                proportionBalance = sub(0, totalPrice)
                totalPrice = 0
                log(`${item.name} ${item.proportionid} 抵扣后的余额${proportionBalance}`)
            } else {
                //总价 = 被抵扣后的值 / 比例值
                totalPrice = div(totalPrice, proportionValue)
                log(`${item.name} ${item.proportionid} ${price}被扣光`)
            }
            deduct.push({ ...item, proportionBalance })
        }
    })

    warn('***********输出前修正部分数据***********')
    let formatPrice = fmoney(totalPrice)
    if (totalPrice < 0) {
        log('修正价格')
        totalPrice = 0
        formatPrice = '0.00'
    }
    return {
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
}





/**
 * 格式化金额
 * @param s 金额数
 * @param n 显示小位数
 * @param fp 标准金额展示
 * @returns {string}
 */
export const fmoney = (s, n = 2, fp = undefined) => {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + '').replace(/[^\d\.-]/g, '')).toFixed(n) + '';
    const l = s.split('.')[0].split('').reverse(),
        r = s.split('.')[1];
    let t = '';
    for (let i = 0; i < l.length; i++) {
        if (fp) {
            t += l[i] + ((i + 1) % 3 == 0 && i + 1 != l.length ? ',' : '');
        } else {
            t += l[i];
        }
    }

    return t.split('').reverse().join('') + '.' + r;
};

/**
 * 获取小数点后数字长度
 * @author zhongjiewang
 * @param  {Number} num 数字
 * @return {Number}     长度
 */
function decimalLength(num) {
    const str = num.toString();
    const index = str.indexOf('.');
    return index == -1 ? 0 : str.substr(index + 1).length;
}

/**
 * 小数点后补齐0作为整数
 * @author zhongjiewang
 * @param  {Number} num    数字
 * @param  {Number} length 补齐的长度
 * @return {Number}        整数
 */
function suffixInteger(num, length) {
    let str = num.toString();
    const decimalLen = decimalLength(num);
    str += Math.pow(10, length - decimalLen)
        .toString()
        .substr(1);
    return Number(str.replace('.', ''));
}

/**
 * 浮点数相乘
 * 使用：num1.mul(num2);
 * return 相乘结果
 */
export const mul = function (num1, num2) {
    if (!num1) num1 = 0;
    if (!num2) num2 = 0;
    const r1 = decimalLength(num1);
    const r2 = decimalLength(num2);

    const max = Math.max(r1, r2);

    const n1 = suffixInteger(num1, max);
    const n2 = suffixInteger(num2, max);

    return (n1 * n2) / Math.pow(10, max * 2);
};

/**
 * 浮点数相加
 */
export const add = function (num1, num2) {
    if (!num1) num1 = 0;
    if (!num2) num2 = 0;
    const r1 = decimalLength(num1);
    const r2 = decimalLength(num2);

    const max = Math.max(r1, r2);

    const n1 = suffixInteger(num1, max);
    const n2 = suffixInteger(num2, max);

    return Number(((n1 + n2) / Math.pow(10, max)).toFixed(max));
};

/**
 ** 减法函数，用来得到精确的减法结果
 ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
 ** 返回值：arg1加上arg2的精确结果
 **/
export const sub = function (num1, num2) {
    if (!num1) num1 = 0;
    if (!num2) num2 = 0;
    const r1 = decimalLength(num1);
    const r2 = decimalLength(num2);

    const max = Math.max(r1, r2);

    const n1 = suffixInteger(num1, max);
    const n2 = suffixInteger(num2, max);

    return Number(((n1 - n2) / Math.pow(10, max)).toFixed(max));
};

/**
 * 除法函数
 * @param num1
 * @param num2
 * @returns {number}
 */
export function div(num1, num2) {
    if (!num1) num1 = 0;
    if (!num2) num2 = 0;
    const r1 = decimalLength(num1);
    const r2 = decimalLength(num2);

    const max = Math.max(r1, r2);

    const n1 = suffixInteger(num1, max);
    const n2 = suffixInteger(num2, max);

    return n1 / n2;
}
