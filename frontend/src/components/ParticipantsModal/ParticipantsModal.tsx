import React from 'react';
import { Modal, List, Avatar, Typography, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface User {
  id: number;
  name: string;
  email: string;
}

const { Text } = Typography;

interface ParticipantsModalProps {
  open: boolean;
  onClose: () => void;
  participants: User[];
  isLoading: boolean;
}

export const ParticipantsModal: React.FC<ParticipantsModalProps> = ({
  open,
  onClose,
  participants,
  isLoading
}) => {
  return (
    <Modal
      title={<span style={{ color: '#ffffff' }}>Участники мероприятия</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      styles={{
        body: { 
          backgroundColor: '#1f1f1f',
          color: '#ffffff'
        },
        header: { 
          backgroundColor: '#1f1f1f',
          borderBottom: '1px solid #434343'
        },
        content: { 
          backgroundColor: '#1f1f1f'
        }
      }}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '10px' }}>
            <Text style={{ color: '#b0b0b0' }}>Загрузка участников...</Text>
          </div>
        </div>
      ) : participants.length === 0 ? (
        <Empty
          description={<span style={{ color: '#b0b0b0' }}>Пока нет участников</span>}
          style={{ padding: '20px' }}
        />
      ) : (
        <List
          dataSource={participants}
          renderItem={(participant) => (
            <List.Item style={{ 
              borderBottom: '1px solid #434343',
              padding: '12px 0'
            }}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    icon={<UserOutlined />}
                    style={{ backgroundColor: '#1890ff' }}
                  />
                }
                title={<span style={{ color: '#ffffff' }}>{participant.name}</span>}
                description={<span style={{ color: '#b0b0b0' }}>{participant.email}</span>}
              />
            </List.Item>
          )}
          style={{ 
            maxHeight: '400px', 
            overflow: 'auto',
            backgroundColor: '#1f1f1f'
          }}
        />
      )}
    </Modal>
  );
};

export default ParticipantsModal;
