import { Component, computed, input } from '@angular/core';
import { ButtonToggleGroupComponent } from '../../../../components/button-toggle-group/button-toggle-group.component';
import { ButtonToggleDirective } from '../../../../components/button-toggle-group/button-toggle.directive';
import { CheckboxComponent } from '../../../../components/checkbox/checkbox.component';
import { HintComponent } from '../../../../components/hint/hint.component';
import { InputDirective } from '../../../../components/input/input.directive';
import { LabelComponent } from '../../../../components/label/label.component';
import { SelectDirective } from '../../../../components/select/select.directive';
import { SwitchComponent } from '../../../../components/switch/switch.component';
import { AnamnesisFieldType } from '../../anamnesis-field-type.enum';
import { AnamnesisField } from '../../anamnesis-field.model';
import { AnamnesisSection } from '../../anamnesis-section.model';

interface PreviewFieldMeta {
  field: AnamnesisField;
  sectionLabel?: string;
  showSectionHeader: boolean;
}

function byDisplayOrder(sections: AnamnesisSection[]) {
  const sectionOrderById = new Map(sections.map((section) => [section.id, section.displayOrder]));
  return (a: AnamnesisField, b: AnamnesisField) => {
    const orderA = a.anamnesisSectionId
      ? (sectionOrderById.get(a.anamnesisSectionId) ?? Infinity)
      : Infinity;
    const orderB = b.anamnesisSectionId
      ? (sectionOrderById.get(b.anamnesisSectionId) ?? Infinity)
      : Infinity;
    return orderA - orderB || a.displayOrder - b.displayOrder;
  };
}

@Component({
  selector: 'app-anamnesis-form-preview',
  imports: [
    ButtonToggleGroupComponent,
    ButtonToggleDirective,
    CheckboxComponent,
    HintComponent,
    InputDirective,
    LabelComponent,
    SelectDirective,
    SwitchComponent,
  ],
  templateUrl: './anamnesis-form-preview.component.html',
})
export class AnamnesisFormPreviewComponent {
  readonly formName = input<string>();
  readonly formDescription = input<string | undefined>();
  readonly sections = input.required<AnamnesisSection[]>();
  readonly fields = input.required<AnamnesisField[]>();

  protected readonly AnamnesisFieldType = AnamnesisFieldType;

  protected readonly fieldMeta = computed<PreviewFieldMeta[]>(() => {
    const sections = this.sections();
    const sectionLabelById = new Map(sections.map((section) => [section.id, section.label]));
    const activeFields = this.fields()
      .filter((field) => field.active)
      .sort(byDisplayOrder(sections));

    let lastSectionLabel: string | undefined;
    return activeFields.map((field) => {
      const sectionLabel = field.anamnesisSectionId
        ? sectionLabelById.get(field.anamnesisSectionId)
        : undefined;
      const showSectionHeader = sectionLabel !== lastSectionLabel;
      lastSectionLabel = sectionLabel;
      return { field, sectionLabel, showSectionHeader };
    });
  });
}
