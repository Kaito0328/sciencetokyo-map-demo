"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { BaseBox } from '../../design/base/BaseBox';
import { BaseText } from '../../design/base/BaseText';
import { BaseInput } from '../../design/base/BaseInput';
import { BaseButton } from '../../design/base/BaseButton';
import { BaseSelect } from '../../design/base/BaseSelect';
import { CoreColorKey, SurfaceKey, RoundKey, ShadowKey, SizeKey, VariantKey, FontWeightKey } from '../../design/tokens';
import { useAreaDataContext } from '../../state/data/AreaDataContext';
import { useUiStateContext } from '../../state/ui/UiStateContext';
import { FilterKind } from '../../state/ui/filters';

type Props = { open: boolean; onClose: () => void };

export const FilterModal: React.FC<Props> = ({ open, onClose }) => {
  const { areas } = useAreaDataContext();
  const { selectedCampusId, selectedAreaId, setSelectedArea, filters, setFilter, clearFilter, resetFilters, filterMode, filterDegree, setFilterMode, setFilterDegree } = useUiStateContext();
  const [localLectureOnly, setLocalLectureOnly] = useState<boolean>(!!filters[FilterKind.LectureOnly]);
  const [localAreaId, setLocalAreaId] = useState<number | null>(selectedAreaId ?? null);
  const [localMinCap, setLocalMinCap] = useState<number>((filters[FilterKind.CapacityGte] as any)?.value ?? 0);
  const [localFilterMode, setLocalFilterMode] = useState<'smooth' | 'strict'>(filterMode);
  const [localFilterDegree, setLocalFilterDegree] = useState<number>(filterDegree);

  useEffect(() => {
    if (!open) return;
    setLocalLectureOnly(!!filters[FilterKind.LectureOnly]);
    setLocalAreaId(selectedAreaId ?? null);
    setLocalMinCap((filters[FilterKind.CapacityGte] as any)?.value ?? 0);
    setLocalFilterMode(filterMode);
    setLocalFilterDegree(filterDegree);
  }, [open, filters, selectedAreaId, filterMode, filterDegree]);

  const areaOptions = useMemo(() => {
    return areas.filter(a => (a as any).campusId === selectedCampusId);
  }, [areas, selectedCampusId]);

  const apply = () => {
    setSelectedArea(localAreaId);
    if (localLectureOnly) setFilter({ kind: FilterKind.LectureOnly }); else clearFilter(FilterKind.LectureOnly);
    const v = Math.max(0, Number(localMinCap) || 0);
    if (v > 0) setFilter({ kind: FilterKind.CapacityGte, value: v }); else clearFilter(FilterKind.CapacityGte);
    setFilterMode(localFilterMode);
    setFilterDegree(localFilterDegree);
    onClose();
  };

  const resetAll = () => {
    setLocalLectureOnly(false);
    setLocalAreaId(null);
    setLocalMinCap(0);
    setLocalFilterMode('smooth');
    setLocalFilterDegree(0.6);
  };

  if (!open) return null;

  return (
    <BaseBox as="div" className="st-fixed st-inset-0" style={{ zIndex: 1200, pointerEvents: 'none' }}>
      <BaseBox as="div" className="st-absolute st-inset-0" style={{ background: 'rgba(0,0,0,0.35)', pointerEvents: 'auto' }} onClick={onClose} />
      <BaseBox
        color={(SurfaceKey as any).SurfaceAlt}
        round={RoundKey.Md}
        shadow={ShadowKey.Lg}
        className="st-absolute"
        style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 'min(92vw, 560px)', maxHeight: '80vh', overflow: 'auto', pointerEvents: 'auto' }}
      >
        <BaseBox as="div" size={SizeKey.MD} className="st-flex" style={{ flexDirection: 'column', gap: 16 }}>
          <BaseBox as="div" className="st-flex st-items-center st-justify-between">
            <BaseText text="フィルター" weight={FontWeightKey.Medium} />
            <BaseButton variant={VariantKey.Ghost} size={SizeKey.SM} onClick={() => { setLocalLectureOnly(false); setLocalAreaId(null); setLocalMinCap(0); }}>リセット</BaseButton>
          </BaseBox>

          <BaseBox as="div" className="st-grid" style={{ gridTemplateColumns: '1fr', gap: 12 }}>
            <BaseBox round={RoundKey.Sm} size={SizeKey.MD} className="st-flex st-items-center st-justify-between">
              <BaseText text="講義室のみ" />
              <BaseInput type="checkbox" checked={localLectureOnly} onChange={(e) => setLocalLectureOnly(!!e.target.checked)} />
            </BaseBox>

            <BaseBox round={RoundKey.Sm} size={SizeKey.MD} className="st-flex" style={{ flexDirection: 'column', gap: 6 }}>
              <BaseText text="エリア" />
              <BaseSelect
                value={(localAreaId ?? '').toString()}
                onChange={(v) => setLocalAreaId(v === '' ? null : Number(v))}
                options={[{ label: 'すべて', value: '' }, ...areaOptions.map(a => ({ label: a.name, value: String(a.id) }))]}
              />
            </BaseBox>

            <BaseBox round={RoundKey.Sm} size={SizeKey.MD} className="st-flex" style={{ flexDirection: 'column', gap: 6 }}>
              <BaseText text="最小収容人数（通常）" />
              <BaseInput type="number" min={0} step={10} value={localMinCap}
                onChange={(e) => setLocalMinCap(Math.max(0, Number(e.target.value) || 0))} />
            </BaseBox>

            <BaseBox round={RoundKey.Sm} size={SizeKey.MD} className="st-flex" style={{ flexDirection: 'column', gap: 6 }}>
              <BaseText text="フィルタの適用方法" />
              <BaseBox as="div" className="st-flex st-items-center" style={{ gap: 12 }}>
                <BaseBox as="label" className="st-flex st-items-center" style={{ gap: 6 }}>
                  <BaseInput type="radio" name="filter-mode" checked={localFilterMode === 'smooth'} onChange={() => setLocalFilterMode('smooth')} />
                  <BaseText text="なめらか" />
                </BaseBox>
                <BaseBox as="label" className="st-flex st-items-center" style={{ gap: 6 }}>
                  <BaseInput type="radio" name="filter-mode" checked={localFilterMode === 'strict'} onChange={() => setLocalFilterMode('strict')} />
                  <BaseText text="完全" />
                </BaseBox>
              </BaseBox>
              {localFilterMode === 'smooth' && (
                <BaseBox as="div" className="st-flex st-items-center" style={{ gap: 8 }}>
                  <BaseText text={`フィルタ度合い: ${localFilterDegree.toFixed(2)}`} />
                  <BaseInput type="range" min={0} max={1} step={0.05} value={localFilterDegree as any} onChange={(e) => setLocalFilterDegree(parseFloat((e.target as any).value))} style={{ flex: 1 }} />
                </BaseBox>
              )}
            </BaseBox>
          </BaseBox>

          <BaseBox as="div" className="st-flex st-justify-end" style={{ gap: 8 }}>
            <BaseButton variant={VariantKey.Ghost} onClick={onClose}>キャンセル</BaseButton>
            <BaseButton onClick={apply} color={CoreColorKey.Primary}>適用</BaseButton>
          </BaseBox>
        </BaseBox>
      </BaseBox>
    </BaseBox>
  );
};

export default FilterModal;
