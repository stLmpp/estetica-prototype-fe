import { BetterAuthClientOptions, createAuthClient } from 'better-auth/client';
import { inject, InjectionToken, Provider, REQUEST } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  adminClient,
  anonymousClient,
  organizationClient,
  usernameClient,
} from 'better-auth/client/plugins';
import { safe, safeAsync } from '../../shared/safe';
import { lastValueFrom } from 'rxjs';
import { isApiErrorResponse } from '../../model/api-error';

async function getRequestBody(req: Request): Promise<string | null> {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return null;
  }

  return (await req.text()) || null;
}

const errorLocalization: Record<string, Record<string, string>> = {
  'pt-BR': {
    // User related errors
    USER_NOT_FOUND: 'Usuário não encontrado',
    FAILED_TO_CREATE_USER: 'Falha ao criar usuário',
    FAILED_TO_UPDATE_USER: 'Falha ao atualizar usuário',
    USER_ALREADY_EXISTS: 'Usuário já existe',
    USER_EMAIL_NOT_FOUND: 'Email do usuário não encontrado',
    USER_ALREADY_HAS_PASSWORD: 'Usuário já possui uma senha. Forneça-a para excluir a conta.',
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Usuário já existe. Use outro email.',

    // Session related errors
    FAILED_TO_CREATE_SESSION: 'Falha ao criar sessão',
    FAILED_TO_GET_SESSION: 'Falha ao obter sessão',
    SESSION_EXPIRED: 'Sessão expirada. Autentique-se novamente para realizar esta ação.',

    // Authentication errors
    INVALID_PASSWORD: 'Senha inválida',
    INVALID_EMAIL: 'Email inválido',
    INVALID_EMAIL_OR_PASSWORD: 'Email ou senha inválidos',
    INVALID_TOKEN: 'Token inválido',
    EMAIL_NOT_VERIFIED: 'Email não verificado',
    CREDENTIAL_ACCOUNT_NOT_FOUND: 'Conta de credenciais não encontrada',

    // Password related errors
    PASSWORD_TOO_SHORT: 'Senha muito curta',
    PASSWORD_TOO_LONG: 'Senha muito longa',

    // Social auth errors
    SOCIAL_ACCOUNT_ALREADY_LINKED: 'Conta já vinculada',
    PROVIDER_NOT_FOUND: 'Provedor não encontrado',
    ID_TOKEN_NOT_SUPPORTED: 'id_token não suportado',
    FAILED_TO_GET_USER_INFO: 'Falha ao obter informações do usuário',

    // Account management errors
    EMAIL_CAN_NOT_BE_UPDATED: 'Email não pode ser atualizado',
    FAILED_TO_UNLINK_LAST_ACCOUNT: 'Você não pode desvincular sua última conta',
    ACCOUNT_NOT_FOUND: 'Conta não encontrada',
  },
};

function extractAngularHeaders(headers: HttpHeaders): Record<string, string> {
  return Object.fromEntries(
    headers.keys().map((key) => [key, headers.getAll(key)?.join(', ') || '']),
  );
}

export const BetterAuthConfig = new InjectionToken<BetterAuthClientOptions>('BetterAuthConfig');

export function createAuthConfig(httpClient: HttpClient) {
  return {
    baseURL: environment.api,
    basePath: '/v1/auth',
    plugins: [adminClient(), anonymousClient(), usernameClient(), organizationClient()],
    fetchOptions: {
      customFetchImpl: async (input, init) => {
        const req = new Request(input, init);
        const body = await getRequestBody(req);

        let headers = new HttpHeaders();
        req.headers.forEach((value, key) => {
          headers = headers.append(key, value);
        });

        const [error, response] = await safeAsync(
          () =>
            lastValueFrom(
              httpClient.request(req.method, req.url, {
                body,
                headers,
                observe: 'response',
                responseType: 'text',
                credentials: req.credentials,
                keepalive: req.keepalive,
                mode: req.mode,
                cache: req.cache,
                redirect: req.redirect,
                referrer: req.referrer,
                referrerPolicy: req.referrerPolicy,
                integrity: req.integrity,
              }),
            ),
          HttpErrorResponse,
        );

        if (!error) {
          return new Response(response.body, {
            status: response.status,
            headers: extractAngularHeaders(response.headers),
          });
        }

        if (typeof error.error === 'string') {
          const [, parsed] = safe(() => JSON.parse(error.error));
          if (parsed) {
            error.headers.set('Content-Type', 'application/json');

            if (isApiErrorResponse(parsed)) {
              parsed.error.message =
                errorLocalization['pt-BR']?.[parsed.error.code] ?? parsed.error.message;
            }

            throw new HttpErrorResponse({
              error: parsed,
              url: error.url ?? undefined,
              headers: error.headers,
              responseType: error.responseType,
              status: error.status,
              redirected: error.redirected,
            });
          }
        }

        throw error;
      },
    },
  } satisfies BetterAuthClientOptions;
}

export function createClient(options: ReturnType<typeof createAuthConfig>) {
  return createAuthClient(options);
}

export type AuthClientType = ReturnType<typeof createClient>;
export type BetterAuthSession = AuthClientType['$Infer']['Session']['session'];
export type BetterAuthOrganization = AuthClientType['$Infer']['Organization'];

export const AuthClient = new InjectionToken<AuthClientType>('better-auth.client');

export function provideBetterAuthClient(): Provider[] {
  return [
    {
      provide: BetterAuthConfig,
      deps: [HttpClient],
      useFactory: createAuthConfig,
    },
    {
      provide: AuthClient,
      deps: [BetterAuthConfig],
      useFactory: createClient,
    },
  ];
}

export function provideBetterAuthServer(): Provider[] {
  return [
    {
      provide: BetterAuthConfig,
      deps: [HttpClient],
      useFactory: () => {
        const httpClient = inject(HttpClient);
        const config: BetterAuthClientOptions = createAuthConfig(httpClient);
        const req = inject(REQUEST, { optional: true });
        const cookieHeader = req?.headers.get('cookie');
        config.fetchOptions ??= {};
        const headers: Record<string, string> = (config.fetchOptions.headers ??= {});
        if (cookieHeader) {
          headers['Cookie'] = cookieHeader;
        }
        return config;
      },
    },
  ];
}
