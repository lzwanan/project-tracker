import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Checkbox, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/services/auth';
import { CompassOutlined } from '@ant-design/icons';

const STORAGE_KEY = 'tracker_remember';

export default function LoginPage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    refreshCaptcha();
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { employeeId, password } = JSON.parse(saved);
        form.setFieldsValue({ employeeId, password, rememberPwd: true });
      } catch {}
    }
  }, []);

  const refreshCaptcha = async () => {
    try {
      const res: any = await authApi.captcha();
      if (res.data?.image) setCaptcha(res.data.image);
    } catch {}
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res: any = await authApi.login(values.employeeId, values.password, values.remember ? 'true' : 'false', values.captcha || '');
      if (res.code === 200) {
        if (values.rememberPwd) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ employeeId: values.employeeId, password: values.password }));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        await refreshUser();
        if (res.data.firstLogin) {
          message.info('首次登录，请修改密码');
        }
        message.success('登录成功');
        navigate('/versions', { replace: true });
      } else {
        message.error(res.message || '登录失败');
        refreshCaptcha();
        form.setFieldValue('captcha', '');
      }
    } catch {
      message.error('登录失败');
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -100, left: -100 }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: -50, right: -50 }} />
      <div style={{ position: 'absolute', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: '40%', right: '15%' }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <Card
          style={{
            width: 420, borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)',
            border: 'none',
          }}
          styles={{ body: { padding: '40px 36px 32px' } }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(102,126,234,0.4)', marginBottom: 16,
            }}>
              <CompassOutlined style={{ fontSize: 28, color: '#fff' }} />
            </div>
            <Typography.Title level={3} style={{ margin: 0, fontWeight: 800, letterSpacing: 2, color: '#1e293b' }}>
              项目事项跟踪
            </Typography.Title>
            <Typography.Text style={{ color: '#94a3b8', fontSize: 13 }}>请登录以继续</Typography.Text>
          </div>

          <Form form={form} onFinish={onFinish} size="large" initialValues={{ remember: true }}>
            <Form.Item name="employeeId" rules={[{ required: true, message: '请输入工号' }]}>
              <Input prefix={<UserOutlined style={{ color: '#94a3b8' }} />} placeholder="工号" style={{ borderRadius: 12, height: 46 }} />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#94a3b8' }} />} placeholder="密码" style={{ borderRadius: 12, height: 46 }} />
            </Form.Item>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <Form.Item name="captcha" style={{ flex: 1, marginBottom: 0 }} rules={[{ required: true, message: '请输入验证码' }]}>
                <Input prefix={<SafetyCertificateOutlined style={{ color: '#94a3b8' }} />} placeholder="验证码" style={{ borderRadius: 12, height: 46 }} />
              </Form.Item>
              <img src={captcha} onClick={refreshCaptcha}
                style={{ width: 110, height: 46, borderRadius: 12, cursor: 'pointer', border: '1px solid #e5e7eb', background: '#f8fafc' }}
                alt="验证码" title="点击刷新" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <Form.Item name="rememberPwd" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox style={{ fontSize: 13, color: '#64748b' }}>记住密码</Checkbox>
              </Form.Item>
              <Form.Item name="remember" valuePropName="checked" style={{ marginBottom: 0 }}>
                <Checkbox style={{ fontSize: 13, color: '#64748b' }}>7天免登录</Checkbox>
              </Form.Item>
            </div>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block
                style={{
                  borderRadius: 12, height: 48, fontWeight: 700, fontSize: 16,
                  background: 'linear-gradient(135deg, #667eea, #764ba2)',
                  border: 'none', boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
                }}>
                登 录
              </Button>
            </Form.Item>
          </Form>

          <Divider plain style={{ margin: '20px 0 8px' }}>
            <Typography.Text style={{ fontSize: 11, color: '#cbd5e1' }}>游客账户: guest / guest</Typography.Text>
          </Divider>
        </Card>
      </motion.div>
    </div>
  );
}
