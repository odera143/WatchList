import { Button, Toast, ToastContainer } from 'react-bootstrap';

interface ToastMessage {
  id: number;
  message: string;
  severity: 'success' | 'error';
}

interface ToastProps {
  messages: ToastMessage[];
  onClose: (id: number) => void;
}

const MyToast = ({ messages, onClose }: ToastProps) => {
  return (
    <ToastContainer
      className='p-3'
      position='top-end'
      style={{ zIndex: 1, marginTop: '56px', position: 'fixed' }}
    >
      {messages.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => onClose(toast.id)}
          autohide
          delay={3000}
          role='alert'
          className={`align-items-center ${
            toast.severity === 'success' ? 'bg-success' : 'bg-danger'
          } mb-2`}
        >
          <div className='d-flex'>
            <Toast.Body>{toast.message}</Toast.Body>
            <Button
              type='button'
              variant='close'
              size='sm'
              className='me-2 m-auto'
              data-bs-dismiss='toast'
            />
          </div>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default MyToast;
