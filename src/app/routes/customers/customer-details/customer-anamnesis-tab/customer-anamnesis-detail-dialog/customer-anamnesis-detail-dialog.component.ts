import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { BadgeComponent } from '../../../../../components/badge/badge.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { AnamnesisFieldType } from '../../../../anamnesis-forms/anamnesis-field-type.enum';
import {
  CustomerAnamnesis,
  CustomerAnamnesisField,
  CustomerAnamnesisStatus,
} from '../customer-anamnesis.model';

export interface CustomerAnamnesisDetailDialogData {
  customerAnamnesis: CustomerAnamnesis;
  formName: string;
}

interface AnswerGroup {
  sectionLabel?: string;
  answers: CustomerAnamnesisField[];
}

@Component({
  selector: 'app-customer-anamnesis-detail-dialog',
  imports: [BadgeComponent, ButtonComponent, DatePipe],
  templateUrl: './customer-anamnesis-detail-dialog.component.html',
  host: {
    class:
      'block max-h-[85vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-800',
  },
})
export class CustomerAnamnesisDetailDialogComponent {
  protected readonly data = inject<CustomerAnamnesisDetailDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<void>);

  protected readonly CustomerAnamnesisStatus = CustomerAnamnesisStatus;

  protected readonly groupedAnswers = computed<AnswerGroup[]>(() => {
    const answers = this.data.customerAnamnesis.answers ?? [];
    const groups: AnswerGroup[] = [];
    for (const answer of answers) {
      const last = groups.at(-1);
      if (last && last.sectionLabel === answer.anamnesisSectionLabel) {
        last.answers.push(answer);
      } else {
        groups.push({ sectionLabel: answer.anamnesisSectionLabel, answers: [answer] });
      }
    }
    return groups;
  });

  protected formatAnswerValue(answer: CustomerAnamnesisField): string {
    if (answer.anamnesisFieldType === AnamnesisFieldType.BOOLEAN) {
      return answer.value === 'true' ? 'Sim' : 'Não';
    }
    if (answer.anamnesisFieldType === AnamnesisFieldType.CHECKBOX) {
      const values = answer.extraValues?.values ?? [];
      if (!values.length) {
        return '-';
      }
      return values
        .map(
          (value) =>
            answer.anamnesisFieldOptions?.find((option) => option.value === value)?.label ?? value,
        )
        .join(', ');
    }
    if (
      answer.anamnesisFieldType === AnamnesisFieldType.RADIO ||
      answer.anamnesisFieldType === AnamnesisFieldType.SELECT
    ) {
      return (
        answer.anamnesisFieldOptions?.find((option) => option.value === answer.value)?.label ||
        answer.value ||
        '-'
      );
    }
    return answer.value || '-';
  }

  protected close() {
    this.dialogRef.close();
  }
}
