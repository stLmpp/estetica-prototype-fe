import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AnamnesisSectionPayload } from './anamnesis-section.dto';
import { AnamnesisSection } from './anamnesis-section.model';

interface AnamnesisSectionResponse {
  data: { anamnesisSection: AnamnesisSection };
}

interface ListAnamnesisSectionResponse {
  data: { anamnesisSections: AnamnesisSection[] };
}

@Service()
export class AnamnesisSectionService {
  private readonly http = inject(HttpClient);

  private baseUrl(anamnesisFormId: string) {
    return `${environment.api}/v1/anamnesis-form/${anamnesisFormId}/section`;
  }

  list(anamnesisFormId: string) {
    return this.http
      .get<ListAnamnesisSectionResponse>(this.baseUrl(anamnesisFormId))
      .pipe(map((response) => response.data.anamnesisSections));
  }

  create(anamnesisFormId: string, payload: AnamnesisSectionPayload) {
    return this.http
      .post<AnamnesisSectionResponse>(this.baseUrl(anamnesisFormId), {
        anamnesisSection: payload,
      })
      .pipe(map((response) => response.data.anamnesisSection));
  }

  update(
    anamnesisFormId: string,
    anamnesisSectionId: string,
    payload: Partial<AnamnesisSectionPayload>,
  ) {
    return this.http.patch<void>(`${this.baseUrl(anamnesisFormId)}/${anamnesisSectionId}`, {
      anamnesisSection: payload,
    });
  }

  delete(anamnesisFormId: string, anamnesisSectionId: string) {
    return this.http.delete<void>(`${this.baseUrl(anamnesisFormId)}/${anamnesisSectionId}`);
  }
}
