import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AnamnesisField } from '../anamnesis-field.model';
import { AnamnesisFieldService } from '../anamnesis-field.service';
import { AnamnesisForm } from '../anamnesis-form.model';
import { AnamnesisSection } from '../anamnesis-section.model';
import { AnamnesisSectionService } from '../anamnesis-section.service';

const FIELDS_LIMIT = 100;
const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar as seções e campos.';
const DEFAULT_DELETE_SECTION_ERROR_MESSAGE = 'Não foi possível excluir a seção.';
const DEFAULT_DELETE_FIELD_ERROR_MESSAGE = 'Não foi possível excluir o campo.';

function byDisplayOrder<T extends { displayOrder: number }>(a: T, b: T) {
  return a.displayOrder - b.displayOrder;
}

@Injectable()
export class AnamnesisFormDetailStore {
  private readonly anamnesisSectionService = inject(AnamnesisSectionService);
  private readonly anamnesisFieldService = inject(AnamnesisFieldService);

  private readonly anamnesisFormSignal = signal<AnamnesisForm | undefined>(undefined);
  readonly anamnesisForm = this.anamnesisFormSignal.asReadonly();

  private readonly sectionsSignal = signal<AnamnesisSection[]>([]);
  readonly sections = this.sectionsSignal.asReadonly();

  private readonly fieldsSignal = signal<AnamnesisField[]>([]);
  readonly fields = this.fieldsSignal.asReadonly();

  private readonly loadingSignal = signal(true);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorMessageSignal = signal<string | null>(null);
  readonly errorMessage = this.errorMessageSignal.asReadonly();

  setAnamnesisForm(anamnesisForm: AnamnesisForm) {
    const isFirstLoad = !this.anamnesisFormSignal();
    this.anamnesisFormSignal.set(anamnesisForm);
    if (isFirstLoad) {
      this.reload(anamnesisForm.id);
    }
  }

  patchAnamnesisForm(patch: Partial<AnamnesisForm>) {
    this.anamnesisFormSignal.update((anamnesisForm) =>
      anamnesisForm ? { ...anamnesisForm, ...patch } : anamnesisForm,
    );
  }

  reload(anamnesisFormId: string) {
    this.loadingSignal.set(true);
    this.errorMessageSignal.set(null);

    forkJoin({
      sections: this.anamnesisSectionService.list(anamnesisFormId),
      fields: this.anamnesisFieldService
        .list({ anamnesisFormId, limit: FIELDS_LIMIT })
        .pipe(map((result) => result.items)),
    }).subscribe({
      next: ({ sections, fields }) => {
        this.sectionsSignal.set([...sections].sort(byDisplayOrder));
        this.fieldsSignal.set([...fields].sort(byDisplayOrder));
        this.loadingSignal.set(false);
      },
      error: (error: unknown) => {
        this.loadingSignal.set(false);
        this.errorMessageSignal.set(extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE));
      },
    });
  }

  addSection(section: AnamnesisSection) {
    this.sectionsSignal.update((sections) => [...sections, section].sort(byDisplayOrder));
  }

  patchSection(sectionId: string, section: AnamnesisSection) {
    this.sectionsSignal.update((sections) =>
      sections.map((s) => (s.id === sectionId ? section : s)).sort(byDisplayOrder),
    );
  }

  deleteSection(anamnesisFormId: string, section: AnamnesisSection) {
    return this.anamnesisSectionService.delete(anamnesisFormId, section.id).pipe(
      tap({
        next: () => {
          this.sectionsSignal.update((sections) => sections.filter((s) => s.id !== section.id));
        },
        error: (error: unknown) => {
          this.errorMessageSignal.set(
            extractApiErrorMessage(error, DEFAULT_DELETE_SECTION_ERROR_MESSAGE),
          );
        },
      }),
    );
  }

  addField(field: AnamnesisField) {
    this.fieldsSignal.update((fields) => [...fields, field].sort(byDisplayOrder));
  }

  patchField(fieldId: string, field: AnamnesisField) {
    this.fieldsSignal.update((fields) =>
      fields.map((f) => (f.id === fieldId ? field : f)).sort(byDisplayOrder),
    );
  }

  deleteField(field: AnamnesisField) {
    return this.anamnesisFieldService.delete(field.id).pipe(
      tap({
        next: () => {
          this.fieldsSignal.update((fields) => fields.filter((f) => f.id !== field.id));
        },
        error: (error: unknown) => {
          this.errorMessageSignal.set(
            extractApiErrorMessage(error, DEFAULT_DELETE_FIELD_ERROR_MESSAGE),
          );
        },
      }),
    );
  }
}
