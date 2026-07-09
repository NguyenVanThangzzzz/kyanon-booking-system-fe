import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows spinner when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Submit</Button>);
    expect(screen.getByRole('button')).toHaveClass('w-full');
  });
});
