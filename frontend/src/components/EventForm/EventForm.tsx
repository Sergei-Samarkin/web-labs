import { useState, useEffect } from 'react';
import { Form, Input, Modal, Select, DatePicker, TimePicker, Button, message, ConfigProvider } from 'antd';
import { createEvent, updateEvent } from '../../api/eventService';
import type { Event } from '../../api/eventService';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

const { TextArea } = Input;
const { Option } = Select;

interface EventFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  event: Event | null;
}

const EventForm: React.FC<EventFormProps> = ({ open, onCancel, onSubmitSuccess, event }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (event) {
      const eventDate = dayjs(event.date);
      form.setFieldsValue({
        title: event.title,
        description: event.description,
        category: event.category,
        date: eventDate,
        time: eventDate,
      });
      setSelectedDate(eventDate);
      setSelectedTime(eventDate);
    } else {
      form.resetFields();
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [event, form]);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      // Combine date and time
      let dateTime = selectedDate;
      if (selectedDate && selectedTime) {
        dateTime = selectedDate
          .hour(selectedTime.hour())
          .minute(selectedTime.minute())
          .second(0);
      }

      const eventData = {
        ...values,
        date: dateTime?.toISOString(),
      };

      if (event) {
        await updateEvent(event.id, eventData);
        message.success('Мероприятие успешно обновлено');
      } else {
        await createEvent(eventData);
        message.success('Мероприятие успешно создано');
      }

      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting event:', error);
      message.error('Произошла ошибка при сохранении мероприятия');
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      await handleSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // This will be called when the form is submitted via the submit button
  const onFinish = async (values: any) => {
    await handleSubmit(values);
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const handleTimeChange = (time: Dayjs | null) => {
    setSelectedTime(time);
  };

  const theme = {
    token: {
      colorBgContainer: '#2d2d2d',
      colorBgElevated: '#2d2d2d',
      colorBorder: '#404040',
      colorPrimary: '#1890ff',
      colorText: '#e0e0e0',
      colorTextPlaceholder: '#a0a0a0',
      colorTextDisabled: '#666',
      colorBgContainerDisabled: '#333',
      colorBgMask: 'rgba(0, 0, 0, 0.65)',
      colorBgSpotlight: 'rgba(0, 0, 0, 0.85)',
      colorTextHeading: '#e0e0e0',
      colorTextLabel: '#e0e0e0',
      colorIcon: '#a0a0a0',
      colorIconHover: '#e0e0e0',
      colorLink: '#1890ff',
      colorLinkHover: '#40a9ff',
      colorLinkActive: '#096dd9',
      colorBorderSecondary: '#404040',
      colorPrimaryBg: '#111b26',
      colorPrimaryBgHover: '#112545',
      colorPrimaryBorder: '#15325f',
      colorPrimaryBorderHover: '#16418a',
      colorPrimaryHover: '#40a9ff',
      colorPrimaryActive: '#096dd9',
      colorPrimaryTextHover: '#40a9ff',
      colorPrimaryText: '#1890ff',
      colorPrimaryTextActive: '#096dd9',
      colorError: '#ff4d4f',
      colorErrorBg: '#2c1618',
      colorErrorBgHover: '#451d1f',
      colorErrorBorder: '#5b2526',
      colorErrorBorderHover: '#7e2e2f',
      colorErrorHover: '#ff7875',
      colorErrorActive: '#d9363e',
      colorErrorTextHover: '#ff7875',
      colorErrorText: '#ff4d4f',
      colorErrorTextActive: '#d9363e',
    },
    components: {
      Modal: {
        contentBg: '#2d2d2d',
        headerBg: '#2d2d2d',
        titleColor: '#e0e0e0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorText: '#e0e0e0',
        colorTextHeading: '#e0e0e0',
        boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.48), 0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 9px 28px 8px rgba(0, 0, 0, 0.2)',
      },
      DatePicker: {
        colorBgContainer: '#2d2d2d',
        colorBgElevated: '#2d2d2d',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
      },
      TimePicker: {
        colorBgContainer: '#2d2d2d',
        colorBgElevated: '#2d2d2d',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
      },
      Select: {
        colorBgContainer: '#2d2d2d',
        colorBgElevated: '#2d2d2d',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
      },
      Input: {
        colorBgContainer: '#2d2d2d',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
      },
      Button: {
        colorPrimary: '#1890ff',
        colorPrimaryHover: '#40a9ff',
        colorPrimaryActive: '#096dd9',
        defaultBg: '#2d2d2d',
        defaultColor: '#e0e0e0',
        defaultBorderColor: '#404040',
        defaultHoverColor: '#40a9ff',
        defaultHoverBorderColor: '#40a9ff',
        defaultActiveColor: '#096dd9',
        defaultActiveBorderColor: '#096dd9',
      },
    },
  };

  return (
    <ConfigProvider theme={theme}>
      <Modal
      title={event ? 'Редактировать мероприятие' : 'Создать мероприятие'}
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={onFormSubmit}
        >
          {event ? 'Обновить' : 'Создать'}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          category: 'Встреча',
        }}
      >
        <Form.Item
          name="title"
          label="Название"
          rules={[{ required: true, message: 'Пожалуйста, введите название мероприятия' }]}
        >
          <Input placeholder="Введите название" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Описание"
          rules={[{ required: true, message: 'Пожалуйста, введите описание' }]}
        >
          <TextArea rows={4} placeholder="Введите описание мероприятия" />
        </Form.Item>

        <Form.Item
          name="category"
          label="Категория"
          rules={[{ required: true, message: 'Пожалуйста, выберите категорию' }]}
        >
          <Select placeholder="Выберите категорию">
            <Option value="Концерт">Концерт</Option>
            <Option value="Лекция">Лекция</Option>
            <Option value="Выставка">Выставка</Option>
            <Option value="Встреча">Встреча</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Дата"
          rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
        >
          <DatePicker
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            onChange={handleDateChange}
            value={selectedDate}
          />
        </Form.Item>

        <Form.Item
          name="time"
          label="Время"
          rules={[{ required: true, message: 'Пожалуйста, выберите время' }]}
        >
          <TimePicker
            style={{ width: '100%' }}
            format="HH:mm"
            minuteStep={15}
            onChange={handleTimeChange}
            value={selectedTime}
          />
        </Form.Item>
      </Form>
    </Modal>
    </ConfigProvider>
  );
};

export default EventForm;
