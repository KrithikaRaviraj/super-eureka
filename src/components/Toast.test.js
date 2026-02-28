import { render, screen, fireEvent } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  test('renders message when provided', () => {
    render(<Toast message="Saved successfully" onClose={() => {}} type="success" />);
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  test('does not render when message is empty', () => {
    render(<Toast message="" onClose={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<Toast message="Error happened" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
