import React from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { CustomerHeader } from './header/CustomerHeader';
import { SellerHeader } from './header/SellerHeader';
import { AdminHeader } from './header/AdminHeader';
import { SupportHeader } from './header/SupportHeader';
import { CourierHeader } from './header/CourierHeader';

export const Header: React.FC = () => {
  const { role, activeView } = useMarketplace();

  // If user is navigating explicitly inside a role's operational view, match role
  if (role === 'courier' || activeView === 'courier_dispatch') {
    return <CourierHeader />;
  }

  if (role === 'seller' || activeView === 'seller_dashboard') {
    return <SellerHeader />;
  }

  if (role === 'admin' || activeView === 'admin_deck') {
    return <AdminHeader />;
  }

  if (role === 'support' || activeView === 'support_disputes') {
    return <SupportHeader />;
  }

  return <CustomerHeader />;
};
