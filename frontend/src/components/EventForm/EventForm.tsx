import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Select, DatePicker, TimePicker, Button, message, ConfigProvider } from 'antd';
import { useAppDispatch } from '../../app/hooks';
import { createEventAsync, updateEventAsync } from '../../features/events/eventsSlice';
import type { Event } from '../../api/eventService';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ru';

const { Option } = Select;

interface EventFormProps {
  open: boolean;
  onCancel: () => void;
  onSubmitSuccess: () => void;
  event: Event | null;
  viewMode?: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  category: 'Концерт' | 'Лекция' | 'Выставка' | 'Встреча';
  date: Dayjs;
  time: Dayjs;
}

const EventForm: React.FC<EventFormProps> = ({ open, onCancel, onSubmitSuccess, event, viewMode = false }) => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: 'Встреча',
      date: null,
      time: null,
    },
  });

  useEffect(() => {
    if (event) {
      const eventDate = dayjs(event.date);
      setValue('title', event.title);
      setValue('description', event.description || '');
      setValue('category', event.category);
      setValue('date', eventDate);
      setValue('time', eventDate);
      setSelectedDate(eventDate);
      setSelectedTime(eventDate);
    } else {
      reset();
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [event, setValue, reset]);

  const disabledDate = (current: Dayjs) => {
    // Запретить выбор дат раньше сегодняшнего дня
    return current && current < dayjs().startOf('day');
  };

  const disabledTime = () => {
    // Используем selectedDate вместо current параметра
    if (selectedDate && selectedDate.isSame(dayjs(), 'day')) {
      const now = dayjs();
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < now.hour(); i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour: number) => {
          // Если выбран текущий час, запретить минуты раньше текущих
          if (selectedHour === now.hour()) {
            const minutes = [];
            for (let i = 0; i < now.minute(); i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
      };
    }
    // Для будущих дат не блокировать время
    return {};
  };

  const onSubmit = async (data: EventFormData) => {
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
        title: data.title,
        description: data.description,
        category: data.category,
        date: new Date(dateTime!.toISOString()),
      };

      if (event) {
        await dispatch(updateEventAsync({ id: event.id, eventData })).unwrap();
        message.success('Мероприятие успешно обновлено');
      } else {
        await dispatch(createEventAsync(eventData)).unwrap();
        message.success('Мероприятие успешно создано');
      }

      onSubmitSuccess();
      onCancel();
    } catch (error) {
      console.error('Error submitting event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Произошла ошибка при сохранении мероприятия';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setValue('date', date);
  };

  const handleTimeChange = (time: Dayjs | null) => {
    setSelectedTime(time);
    setValue('time', time);
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
        colorBgContainer: '#1a1a1a',
        colorBgElevated: '#1a1a1a',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
        cellHoverBg: '#2d2d2d',
        cellActiveBg: '#1890ff',
        cellBg: '#1a1a1a',
        calendarBg: '#1a1a1a',
        headerBg: '#1a1a1a',
      },
      TimePicker: {
        colorBgContainer: '#1a1a1a',
        colorBgElevated: '#1a1a1a',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
        cellHoverBg: '#2d2d2d',
        cellActiveBg: '#1890ff',
        cellBg: '#1a1a1a',
        panelBg: '#1a1a1a',
      },
      Select: {
        colorBgContainer: '#1a1a1a',
        colorBgElevated: '#1a1a1a',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorIcon: '#a0a0a0',
        colorIconHover: '#e0e0e0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
        optionSelectedBg: '#1890ff',
        optionActiveBg: '#2d2d2d',
        optionBg: '#1a1a1a',
      },
      Input: {
        colorBgContainer: '#1a1a1a',
        colorBorder: '#404040',
        colorPrimary: '#1890ff',
        colorText: '#e0e0e0',
        colorTextPlaceholder: '#a0a0a0',
        colorTextDisabled: '#666',
        colorBgContainerDisabled: '#333',
        inputBg: '#1a1a1a',
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
        title={viewMode ? 'Просмотр мероприятия' : (event ? 'Редактировать мероприятие' : 'Создать мероприятие')}
        open={open}
        onCancel={onCancel}
        footer={viewMode ? [
          <Button key="close" onClick={onCancel}>
            Закрыть
          </Button>
        ] : [
          <Button key="cancel" onClick={onCancel}>
            Отмена
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSubmit(onSubmit)}
          >
            {event ? 'Обновить' : 'Создать'}
          </Button>,
        ]}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
              Название
            </label>
            <Controller
              name="title"
              control={control}
              rules={{
                required: 'Пожалуйста, введите название мероприятия',
                minLength: {
                  value: 3,
                  message: 'Название должно содержать минимум 3 символа',
                },
              }}
              render={({ field }) => (
                <input
                  {...field}
                  type="text"
                  placeholder="Введите название"
                  disabled={viewMode}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: viewMode ? '#0a0a0a' : '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    color: viewMode ? '#888' : '#e0e0e0',
                    fontSize: '14px',
                  }}
                />
              )}
            />
            {errors.title && !viewMode && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                {errors.title.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
              Описание
            </label>
            <Controller
              name="description"
              control={control}
              rules={{
                required: 'Пожалуйста, введите описание',
              }}
              render={({ field }) => (
                <textarea
                  {...field}
                  rows={4}
                  placeholder="Введите описание мероприятия"
                  disabled={viewMode}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: viewMode ? '#0a0a0a' : '#1a1a1a',
                    border: '1px solid #404040',
                    borderRadius: '6px',
                    color: viewMode ? '#888' : '#e0e0e0',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              )}
            />
            {errors.description && !viewMode && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                {errors.description.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
              Категория
            </label>
            <Controller
              name="category"
              control={control}
              rules={{
                required: 'Пожалуйста, выберите категорию',
              }}
              render={({ field }) => (
                <Select
                  {...field}
                  placeholder="Выберите категорию"
                  disabled={viewMode}
                  style={{ width: '100%' }}
                >
                  <Option value="Концерт">Концерт</Option>
                  <Option value="Лекция">Лекция</Option>
                  <Option value="Выставка">Выставка</Option>
                  <Option value="Встреча">Встреча</Option>
                </Select>
              )}
            />
            {errors.category && !viewMode && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                {errors.category.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
              Дата
            </label>
            <Controller
              name="date"
              control={control}
              rules={{
                required: 'Пожалуйста, выберите дату',
                validate: (value) => {
                  if (!value) return 'Пожалуйста, выберите дату';
                  if (value.isBefore(dayjs().startOf('day'))) {
                    return 'Нельзя выбрать дату раньше сегодняшнего дня';
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  style={{ width: '100%' }}
                  format="DD.MM.YYYY"
                  onChange={handleDateChange}
                  value={selectedDate}
                  disabledDate={disabledDate}
                  disabled={viewMode}
                />
              )}
            />
            {errors.date && !viewMode && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                {errors.date.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#e0e0e0' }}>
              Время
            </label>
            <Controller
              name="time"
              control={control}
              rules={{
                required: 'Пожалуйста, выберите время',
                validate: (value) => {
                  if (!value) return 'Пожалуйста, выберите время';
                  if (selectedDate && selectedDate.isSame(dayjs(), 'day')) {
                    const now = dayjs();
                    if (value.isBefore(now)) {
                      return 'Нельзя выбрать время раньше текущего для сегодняшнего дня';
                    }
                  }
                  return true;
                },
              }}
              render={({ field }) => (
                <TimePicker
                  {...field}
                  style={{ width: '100%' }}
                  format="HH:mm"
                  minuteStep={5}
                  onChange={handleTimeChange}
                  value={selectedTime}
                  disabledTime={disabledTime}
                  disabled={viewMode}
                />
              )}
            />
            {errors.time && !viewMode && (
              <div style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '4px' }}>
                {errors.time.message}
              </div>
            )}
          </div>
        </form>
      </Modal>
    </ConfigProvider>
  );
};

export default EventForm;
