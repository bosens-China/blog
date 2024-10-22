import { Spin, ConfigProvider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

export default function Loading() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgMask: '#333',
        },
      }}
    >
      <Spin fullscreen indicator={<LoadingOutlined style={{ fontSize: '5rem' }} spin />} tip="loading..." />
    </ConfigProvider>
  );
}
