'use client';

import { Button, Form, Modal, Radio } from 'antd';
import { useEffect, useState } from 'react';
import { store, Theme } from '@/store';

export interface Values {
  theme: Theme;
}

export const SetUp = () => {
  const [open, setOpen] = useState(false);
  const { theme } = store;

  const [form] = Form.useForm<Values>();
  useEffect(() => {
    if (!open) {
      return;
    }
    if (theme) {
      form.setFieldsValue({ theme });
    } else {
      form.resetFields();
    }
  }, [open, theme, form]);

  const onSave = async () => {
    const values = await form.validateFields();
    store('theme', values.theme);
  };

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
        }}
        className="_expand mt-4.5 font-400 text-size-3.5 lh-4.1 color-#999 text-center underline"
      >
        页面设置
      </button>

      <Modal
        open={open}
        title="页面设置"
        width={450}
        onCancel={() => {
          setOpen(false);
        }}
        onClose={() => {
          setOpen(false);
        }}
        footer={
          <div className="flex items-center justify-center">
            <Button className="w-50! h-10!" type="primary" onClick={onSave}>
              保存
            </Button>
          </div>
        }
      >
        <div className="p-4% p-b-2">
          <Form layout="vertical" form={form}>
            <Form.Item<Values> label="主题设置" name="theme">
              <Radio.Group size="large" className="w-100%! flex!">
                <Radio.Button className="flex-1 text-center" value="auto">
                  跟随系统
                </Radio.Button>
                <Radio.Button className="flex-1 text-center" value="light">
                  浅色
                </Radio.Button>
                <Radio.Button className="flex-1 text-center" value="dark">
                  深色
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  );
};
