"use client";
import React from 'react';
import { BaseInput } from '../../design/base/BaseInput';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { useUiStateContext } from '../../state/ui/UiStateContext';
import { FilterKind } from '../../state/ui/filters';

export type LecturePriorityToggleProps = {
  label?: string;
  degreeOn?: number;
  degreeOff?: number;
  className?: string;
  style?: React.CSSProperties;
};

const LecturePriorityToggle: React.FC<LecturePriorityToggleProps> = ({
  label = '講義棟優先',
  degreeOn = 0.5,
  degreeOff = 0.6,
  className,
  style,
}) => {
  const { lectureSmoothEnabled, setLectureSmoothEnabled, setFilter, clearFilter, setFilterMode, setFilterDegree } = useUiStateContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = !!e.target.checked;
    setLectureSmoothEnabled(v);
    if (v) {
      setFilter({ kind: FilterKind.LectureOnly } as any);
      setFilterMode('smooth');
      setFilterDegree(degreeOn);
    } else {
      clearFilter(FilterKind.LectureOnly);
      setFilterDegree(degreeOff);
    }
  };

  return (
    <BaseBox as="label" className={["st-flex", "st-items-center", className].filter(Boolean).join(' ')} style={{ gap: 8, ...(style || {}) }}>
      <BaseInput type="checkbox" checked={lectureSmoothEnabled} onChange={onChange} />
      <BaseText className="st-fs-sm" text={label} />
    </BaseBox>
  );
};

export default LecturePriorityToggle;
