'use client';

import { Image, Space } from 'antd';
import myPay from '@/assets/img/my-pay.jpeg';
import { useState } from 'react';

export const Appreciate = () => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Space
        className="cursor-pointer"
        onClick={() => {
          setVisible(true);
        }}
        title="支付宝赞赏～"
      >
        <span>☕️</span>
        请我和一杯咖啡
      </Space>
      <Image
        width={0}
        alt="支付宝收款码"
        className="hidden"
        src={myPay.src}
        preview={{
          visible,
          // scaleStep,
          src: myPay.src,
          onVisibleChange: (value) => {
            setVisible(value);
          },
        }}
      />
    </>
  );
};
