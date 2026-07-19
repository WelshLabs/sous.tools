import { render } from '@testing-library/react';
import { POSRegisterView } from './pos.view';

describe('POSRegisterView', () => {
  it('renders without crashing', () => {
    const { getByText } = render(
      <POSRegisterView 
        catalog={<div>Catalog Content</div>} 
        ticket={<div>Ticket Content</div>} 
      />
    );
    expect(getByText('Catalog Content')).toBeInTheDocument();
    expect(getByText('Ticket Content')).toBeInTheDocument();
  });
});
