import { computed, inject } from '@angular/core';
import { patchState, signalStore, type, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../../model/api-error';
import { AnamnesisField } from '../anamnesis-field.model';
import { AnamnesisFieldService } from '../anamnesis-field.service';
import { AnamnesisForm } from '../anamnesis-form.model';
import { AnamnesisSection } from '../anamnesis-section.model';
import { AnamnesisSectionService } from '../anamnesis-section.service';

const DEFAULT_LOAD_ERROR_MESSAGE = 'Não foi possível carregar as seções e campos.';
const DEFAULT_DELETE_SECTION_ERROR_MESSAGE = 'Não foi possível excluir a seção.';
const DEFAULT_DELETE_FIELD_ERROR_MESSAGE = 'Não foi possível excluir o campo.';

function byDisplayOrder<T extends { displayOrder: number }>(a: T, b: T) {
  return a.displayOrder - b.displayOrder;
}

interface AnamnesisFormDetailState {
  anamnesisForm: AnamnesisForm | undefined;
  loading: boolean;
  errorMessage: string | null;
}

const initialState: AnamnesisFormDetailState = {
  anamnesisForm: undefined,
  loading: true,
  errorMessage: null,
};

export const AnamnesisFormDetailStore = signalStore(
  withState(initialState),
  withEntities({ entity: type<AnamnesisSection>(), collection: 'sections' }),
  withEntities({ entity: type<AnamnesisField>(), collection: 'fields' }),
  withComputed((store) => ({
    sections: computed(() => [...store.sectionsEntities()].sort(byDisplayOrder)),
    fields: computed(() => [...store.fieldsEntities()].sort(byDisplayOrder)),
  })),
  withMethods(
    (
      store,
      anamnesisSectionService = inject(AnamnesisSectionService),
      anamnesisFieldService = inject(AnamnesisFieldService),
    ) => {
      const reload = rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, errorMessage: null })),
          switchMap((anamnesisFormId) =>
            forkJoin({
              sections: anamnesisSectionService.list(anamnesisFormId),
              fields: anamnesisFieldService.list({ anamnesisFormId }),
            }).pipe(
              tapResponse({
                next: ({ sections, fields }) => {
                  patchState(store, setAllEntities(sections, { collection: 'sections' }));
                  patchState(store, setAllEntities(fields, { collection: 'fields' }));
                },
                error: (error: unknown) => {
                  patchState(store, {
                    errorMessage: extractApiErrorMessage(error, DEFAULT_LOAD_ERROR_MESSAGE),
                  });
                },
                finalize: () => patchState(store, { loading: false }),
              }),
            ),
          ),
        ),
      );

      return {
        setAnamnesisForm(anamnesisForm: AnamnesisForm) {
          const isFirstLoad = !store.anamnesisForm();
          patchState(store, { anamnesisForm });
          if (isFirstLoad) {
            reload(anamnesisForm.id);
          }
        },

        patchAnamnesisForm(patch: Partial<AnamnesisForm>) {
          patchState(store, (state) => ({
            anamnesisForm: state.anamnesisForm
              ? { ...state.anamnesisForm, ...patch }
              : state.anamnesisForm,
          }));
        },

        addSection(section: AnamnesisSection) {
          patchState(store, addEntity(section, { collection: 'sections' }));
        },

        patchSection(sectionId: string, section: AnamnesisSection) {
          patchState(
            store,
            updateEntity({ id: sectionId, changes: section }, { collection: 'sections' }),
          );
        },

        deleteSection(anamnesisFormId: string, section: AnamnesisSection) {
          return anamnesisSectionService.delete(anamnesisFormId, section.id).pipe(
            tapResponse({
              next: () => patchState(store, removeEntity(section.id, { collection: 'sections' })),
              error: (error: unknown) => {
                patchState(store, {
                  errorMessage: extractApiErrorMessage(error, DEFAULT_DELETE_SECTION_ERROR_MESSAGE),
                });
              },
            }),
          );
        },

        addField(field: AnamnesisField) {
          patchState(store, addEntity(field, { collection: 'fields' }));
        },

        patchField(fieldId: string, field: AnamnesisField) {
          patchState(
            store,
            updateEntity({ id: fieldId, changes: field }, { collection: 'fields' }),
          );
        },

        deleteField(field: AnamnesisField) {
          return anamnesisFieldService.delete(field.id).pipe(
            tapResponse({
              next: () => patchState(store, removeEntity(field.id, { collection: 'fields' })),
              error: (error: unknown) => {
                patchState(store, {
                  errorMessage: extractApiErrorMessage(error, DEFAULT_DELETE_FIELD_ERROR_MESSAGE),
                });
              },
            }),
          );
        },
      };
    },
  ),
);
