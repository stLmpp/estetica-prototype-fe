import { computed, inject } from '@angular/core';
import {
  patchState,
  signalMethod,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  prependEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { extractApiErrorMessage } from '../../model/api-error';
import { AnamnesisForm } from './anamnesis-form.model';
import { AnamnesisFormService } from './anamnesis-form.service';

export const PAGE_SIZE = 10;
const DEFAULT_ERROR_MESSAGE = 'Não foi possível carregar as anamneses.';
const DEFAULT_DELETE_ERROR_MESSAGE = 'Não foi possível excluir a anamnese.';

interface AnamnesisFormsMeta {
  total: number;
  page: number;
  name: string;
  reloadTrigger: number;
  loading: boolean;
  errorMessage: string | null;
}

const initialMeta: AnamnesisFormsMeta = {
  total: 0,
  page: 1,
  name: '',
  reloadTrigger: 0,
  loading: true,
  errorMessage: null,
};

interface LoadParams {
  name: string;
  page: number;
}

export const AnamnesisFormsStore = signalStore(
  withEntities<AnamnesisForm>(),
  withState(initialMeta),
  withMethods((store, anamnesisFormService = inject(AnamnesisFormService)) => ({
    load: rxMethod<LoadParams>(
      pipe(
        tap(() => patchState(store, { loading: true, errorMessage: null })),
        switchMap(({ name, page }) =>
          anamnesisFormService.list({ page, limit: PAGE_SIZE, name: name || undefined }).pipe(
            tapResponse({
              next: (result) => {
                patchState(store, setAllEntities(result.items));
                patchState(store, { total: result.meta.total, page });
              },
              error: (error: unknown) => {
                patchState(store, setAllEntities<AnamnesisForm>([]));
                patchState(store, {
                  total: 0,
                  page,
                  errorMessage: extractApiErrorMessage(error, DEFAULT_ERROR_MESSAGE),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    setSearch: signalMethod<string>((name) => {
      const trimmed = name.trim();
      if (trimmed === store.name()) {
        return;
      }
      patchState(store, { name: trimmed, page: 1 });
    }),

    setPage(page: number) {
      patchState(store, { page });
    },

    addAnamnesisForm(anamnesisForm: AnamnesisForm) {
      patchState(store, prependEntity(anamnesisForm));
      patchState(store, (state) => ({ total: state.total + 1 }));

      const entities = store.entities();
      const lastEntity = entities.at(-1);
      if (entities.length > PAGE_SIZE && lastEntity) {
        patchState(store, removeEntity(lastEntity.id));
      }
    },

    patchAnamnesisForm(anamnesisFormId: string, changes: Partial<AnamnesisForm>) {
      patchState(store, updateEntity({ id: anamnesisFormId, changes }));
    },

    deleteAnamnesisForm(anamnesisForm: AnamnesisForm) {
      patchState(store, { loading: true, errorMessage: null });

      return anamnesisFormService.delete(anamnesisForm.id).pipe(
        tapResponse({
          next: () => {
            const isLastOnPage = store.entities().length === 1 && store.page() > 1;
            if (isLastOnPage) {
              patchState(store, (state) => ({ page: state.page - 1 }));
            } else {
              patchState(store, (state) => ({ reloadTrigger: state.reloadTrigger + 1 }));
            }
          },
          error: (error: unknown) => {
            patchState(store, {
              loading: false,
              errorMessage: extractApiErrorMessage(error, DEFAULT_DELETE_ERROR_MESSAGE),
            });
          },
        }),
      );
    },
  })),
  withHooks({
    onInit(store) {
      store.load(
        computed(() => {
          store.reloadTrigger();
          return { name: store.name(), page: store.page() };
        }),
      );
    },
  }),
);
