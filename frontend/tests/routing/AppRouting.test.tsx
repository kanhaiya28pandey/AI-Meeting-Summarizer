import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import { AppLayout } from '../../src/components/layout/AppLayout';
import { Home } from '../../src/pages/Home';
import { Meetings } from '../../src/pages/Meetings';
import { Settings } from '../../src/pages/Settings';
import { NotFound } from '../../src/pages/NotFound';

function renderWithRouter(initialRoute: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('Frontend App Routing', () => {
  it('renders Home page at root path /', () => {
    renderWithRouter('/');
    expect(screen.getByRole('heading', { name: /turn meetings into action/i })).toBeInTheDocument();
  });

  it('renders Settings page at /settings', () => {
    renderWithRouter('/settings');
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders NotFound page on unmatched route', () => {
    renderWithRouter('/non-existent-page-url');
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });
});
