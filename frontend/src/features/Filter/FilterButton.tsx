"use client";
import React from 'react';
import { BaseButton } from '../../design/base/BaseButton';
import { BaseText } from '../../design/base/BaseText';
import { SizeKey, VariantKey, RoundKey } from '../../design/tokens';

type Props = {
  onClick?: () => void;
  label?: string;
};

const FunnelIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M3 5.5C3 4.67157 3.67157 4 4.5 4H19.5C20.3284 4 21 4.67157 21 5.5C21 5.82639 20.893 6.143 20.694 6.406L14 15V20.5C14 20.7761 13.7761 21 13.5 21H10.5C10.2239 21 10 20.7761 10 20.5V15L3.30604 6.40604C3.10701 6.14301 3 5.82639 3 5.5Z"
      fill="currentColor"
    />
  </svg>
);

export const FilterButton: React.FC<Props> = ({ onClick, label = 'フィルター' }) => {
  const handleClick = () => {
    if (onClick) return onClick();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-filter-modal'));
    }
  };

  return (
    <BaseButton onClick={handleClick} size={SizeKey.SM} variant={VariantKey.Solid} intent="primary" round={RoundKey.Sm}
      className="st-inline-flex st-items-center st-gap-sm st-filter-btn-pc"
    >
      <FunnelIcon />
      <BaseText text={label} />
    </BaseButton>
  );
};

export default FilterButton;
