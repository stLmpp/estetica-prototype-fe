import { Component } from '@angular/core';

@Component({
  selector: 'app-temp',
  template: `
    <!-- ===================== HEADER / TOOLBAR ===================== -->
    <header
      class="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 shadow-sm backdrop-blur dark:border-neutral-700 dark:bg-neutral-800/90"
    >
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
        <!-- Logo -->
        <a href="#" class="flex shrink-0 items-center gap-3">
          <span
            class="bg-primary-500 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
            >MS</span
          >
          <span class="text-primary-800 dark:text-primary-300 text-lg leading-tight font-semibold"
            >M'Salla<br /><span
              class="text-primary-500 text-xs font-normal tracking-widest uppercase"
              >Estética</span
            ></span
          >
        </a>
        <!-- Nav links -->
        <nav
          class="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex dark:text-neutral-300"
        >
          <a href="#" class="hover:text-primary-500 transition-colors">Início</a>
          <a href="#" class="hover:text-primary-500 transition-colors">Serviços</a>
          <a href="#" class="hover:text-primary-500 transition-colors">Sobre</a>
          <a href="#" class="hover:text-primary-500 transition-colors">Contato</a>
        </nav>
        <!-- Theme Toggle -->
        <button
          id="theme-toggle"
          aria-label="Alternar tema"
          class="focus:ring-primary-400 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:outline-none dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <!-- Sun icon (shown in dark mode) -->
          <svg
            id="icon-sun"
            xmlns="http://www.w3.org/2000/svg"
            class="hidden h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
          <!-- Moon icon (shown in light mode) -->
          <svg
            id="icon-moon"
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
            />
          </svg>
        </button>
        <!-- CTA -->
        <button
          class="bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
        >
          Agendar
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-7xl space-y-20 px-4 py-12">
      <!-- ===================== SECTION TITLE HELPER ===================== -->
      <!-- Used as section dividers throughout the page -->

      <!-- ===================== BUTTONS ===================== -->
      <section aria-labelledby="sec-buttons">
        <h2 id="sec-buttons" class="text-primary-800 dark:text-primary-300 mb-1 text-2xl font-bold">
          Botões
        </h2>
        <p class="mb-6 text-sm text-neutral-700 dark:text-neutral-300">
          Variantes: Primary, Secondary/Tonal, Outline, Text, Icon e Loading
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <!-- Primary -->
          <button
            class="bg-primary-500 hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-400 cursor-pointer rounded-full px-6 py-2.5 font-semibold text-white transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          >
            Primary
          </button>
          <!-- Secondary / Tonal -->
          <button
            class="bg-primary-100 hover:bg-primary-200 active:bg-primary-300 text-primary-800 focus:ring-primary-300 dark:bg-primary-900 dark:text-primary-200 dark:hover:bg-primary-800 cursor-pointer rounded-full px-6 py-2.5 font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Secondary
          </button>
          <!-- Outline -->
          <button
            class="border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-400 dark:text-primary-300 dark:hover:bg-primary-900 cursor-pointer rounded-full border-2 px-6 py-2.5 font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Outline
          </button>
          <!-- Text -->
          <button
            class="text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-300 dark:text-primary-300 dark:hover:bg-primary-900 cursor-pointer rounded-full px-6 py-2.5 font-semibold transition-colors focus:ring-2 focus:outline-none"
          >
            Text
          </button>
          <!-- Icon -->
          <button
            aria-label="Favoritar"
            class="bg-primary-100 hover:bg-primary-200 text-primary-700 focus:ring-primary-400 dark:bg-primary-900 dark:text-primary-300 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors focus:ring-2 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <!-- Loading -->
          <button
            disabled
            aria-busy="true"
            class="bg-primary-500 inline-flex cursor-not-allowed items-center gap-2 rounded-full px-6 py-2.5 font-semibold text-white opacity-75"
          >
            <svg
              class="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Salvando...
          </button>
          <!-- Disabled -->
          <button
            disabled
            class="bg-primary-500 cursor-not-allowed rounded-full px-6 py-2.5 font-semibold text-white opacity-40"
          >
            Disabled
          </button>
        </div>

        <!-- Button Toggle Group -->
        <div class="mt-8">
          <p class="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Button Toggle Group
          </p>
          <div
            role="group"
            aria-label="Tipo de serviço"
            class="border-primary-300 dark:border-primary-700 inline-flex rounded-full border"
          >
            <button
              class="bg-primary-500 focus:ring-primary-400 cursor-pointer rounded-l-full px-5 py-2 text-sm font-semibold text-white focus:ring-2 focus:outline-none focus:ring-inset"
            >
              Facial
            </button>
            <button
              class="text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900 focus:ring-primary-400 border-primary-300 dark:border-primary-700 cursor-pointer border-x px-5 py-2 text-sm font-semibold focus:ring-2 focus:outline-none focus:ring-inset"
            >
              Corporal
            </button>
            <button
              class="text-primary-700 hover:bg-primary-50 dark:text-primary-300 dark:hover:bg-primary-900 focus:ring-primary-400 cursor-pointer rounded-r-full px-5 py-2 text-sm font-semibold focus:ring-2 focus:outline-none focus:ring-inset"
            >
              Depilação
            </button>
          </div>
        </div>
      </section>

      <!-- ===================== BADGES & CHIPS ===================== -->
      <section aria-labelledby="sec-badges">
        <h2 id="sec-badges" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Badges &amp; Chips
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <!-- Badges -->
          <span class="bg-primary-500 rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            >Novo</span
          >
          <span
            class="bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-200 rounded-full px-2.5 py-0.5 text-xs font-bold"
            >Promoção</span
          >
          <span
            class="rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
            >Padrão</span
          >

          <!-- Chips -->
          <span
            class="border-primary-300 text-primary-700 dark:border-primary-600 dark:text-primary-300 flex items-center gap-1.5 rounded-full border px-4 py-1 text-sm font-medium"
          >
            Limpeza de Pele
            <button aria-label="Remover" class="hover:text-primary-900 dark:hover:text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
          <span
            class="bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full px-4 py-1 text-sm font-medium"
            >Microagulhamento</span
          >
        </div>
      </section>

      <!-- ===================== FORM CONTROLS ===================== -->
      <section aria-labelledby="sec-forms">
        <h2 id="sec-forms" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Controles de Formulário
        </h2>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <!-- Input Text — estado normal -->
          <div class="flex flex-col gap-1.5">
            <label
              for="input-name"
              class="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >Nome completo</label
            >
            <input
              id="input-name"
              type="text"
              placeholder="Ex: Marcia Rosanelli"
              class="focus:ring-primary-400 focus:border-primary-400 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-300"
            />
            <p class="min-h-5 text-xs text-neutral-400 dark:text-neutral-400"></p>
          </div>

          <!-- Input Text — estado de erro -->
          <div class="flex flex-col gap-1.5">
            <label
              for="input-name-error"
              class="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >Nome completo <span class="text-red-500">*</span></label
            >
            <input
              id="input-name-error"
              type="text"
              value="Ma"
              aria-invalid="true"
              aria-describedby="input-name-error-msg"
              class="rounded-xl border border-red-400 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:ring-2 focus:ring-red-300 focus:outline-none dark:border-red-500 dark:bg-neutral-800 dark:text-neutral-100"
            />
            <p id="input-name-error-msg" class="min-h-5 text-xs text-red-500">
              O nome deve ter pelo menos 3 caracteres.
            </p>
          </div>

          <!-- Select — estado de erro -->
          <div class="flex flex-col gap-1.5">
            <label
              for="select-service"
              class="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >Serviço <span class="text-red-500">*</span></label
            >
            <select
              id="select-service"
              aria-invalid="true"
              aria-describedby="select-service-error-msg"
              class="rounded-xl border border-red-400 bg-white px-4 py-2.5 text-sm text-neutral-900 transition focus:ring-2 focus:ring-red-300 focus:outline-none dark:border-red-500 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="">Selecione um serviço</option>
              <option>Limpeza de Pele</option>
              <option>Hidratação Facial</option>
              <option>Microagulhamento</option>
              <option>Peeling de Diamante</option>
              <option>Depilação</option>
            </select>
            <p id="select-service-error-msg" class="min-h-5 text-xs text-red-500">
              Selecione um serviço para continuar.
            </p>
          </div>

          <!-- Datepicker — estado normal -->
          <div class="flex flex-col gap-1.5">
            <label
              for="input-date"
              class="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >Data do agendamento</label
            >
            <div class="relative">
              <input
                id="input-date"
                type="date"
                class="focus:ring-primary-400 focus:border-primary-400 w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 transition focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
            <p class="min-h-5 text-xs text-neutral-400 dark:text-neutral-400"></p>
          </div>

          <!-- Slider -->
          <div class="flex flex-col gap-1.5" style="margin-top: 0">
            <label
              for="slider-intensity"
              class="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
              >Intensidade do tratamento</label
            >
            <input
              id="slider-intensity"
              type="range"
              min="0"
              max="100"
              value="60"
              class="bg-primary-200 accent-primary-500 dark:bg-primary-900 h-2 w-full cursor-pointer appearance-none rounded-full"
            />
            <div class="flex justify-between text-xs text-neutral-700 dark:text-neutral-300">
              <span>Suave</span><span>Intenso</span>
            </div>
          </div>

          <!-- Checkbox -->
          <div class="flex flex-col gap-3">
            <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Preferências</p>
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked
                class="accent-primary-500 focus:ring-primary-400 h-4 w-4 rounded border-neutral-300"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300"
                >Receber lembretes por WhatsApp</span
              >
            </label>
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                class="accent-primary-500 focus:ring-primary-400 h-4 w-4 rounded border-neutral-300"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300"
                >Aceitar promoções por e-mail</span
              >
            </label>
          </div>

          <!-- Radio -->
          <div class="flex flex-col gap-3">
            <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Turno preferido
            </p>
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="turno"
                value="manha"
                checked
                class="accent-primary-500 focus:ring-primary-400 h-4 w-4"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Manhã</span>
            </label>
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="turno"
                value="tarde"
                class="accent-primary-500 focus:ring-primary-400 h-4 w-4"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Tarde</span>
            </label>
            <label class="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="turno"
                value="noite"
                class="accent-primary-500 focus:ring-primary-400 h-4 w-4"
              />
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Noite</span>
            </label>
          </div>

          <!-- Slide Toggle / Switch -->
          <div class="flex flex-col gap-3">
            <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Slide Toggle (Switch)
            </p>
            <label class="flex cursor-pointer items-center gap-3">
              <span class="relative inline-flex h-6 w-11 shrink-0">
                <input type="checkbox" checked class="peer sr-only" />
                <span
                  class="peer-checked:bg-primary-500 absolute inset-0 rounded-full bg-neutral-300 transition dark:bg-neutral-600"
                ></span>
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
                ></span>
              </span>
              <span class="text-sm text-neutral-700 dark:text-neutral-300"
                >Notificações ativas</span
              >
            </label>
            <label class="flex cursor-pointer items-center gap-3">
              <span class="relative inline-flex h-6 w-11 shrink-0">
                <input type="checkbox" class="peer sr-only" />
                <span
                  class="peer-checked:bg-primary-500 absolute inset-0 rounded-full bg-neutral-300 transition dark:bg-neutral-600"
                ></span>
                <span
                  class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
                ></span>
              </span>
              <span class="text-sm text-neutral-700 dark:text-neutral-300">Modo silencioso</span>
            </label>
          </div>
        </div>
      </section>

      <!-- ===================== CARD ===================== -->
      <section aria-labelledby="sec-cards">
        <h2 id="sec-cards" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Cards
        </h2>
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article
            class="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <!-- Card Header -->
            <div
              class="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-700"
            >
              <span
                class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300 flex h-8 w-8 items-center justify-center rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </span>
              <h3 class="font-semibold text-neutral-800 dark:text-neutral-100">Limpeza de Pele</h3>
            </div>
            <!-- Card Content -->
            <div class="flex-1 px-5 py-4 text-sm text-neutral-700 dark:text-neutral-300">
              Tratamento profundo que remove impurezas, cravos e células mortas, deixando a pele
              renovada e radiante.
            </div>
            <!-- Card Footer -->
            <div
              class="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700"
            >
              <span class="text-primary-600 dark:text-primary-300 font-bold">R$ 120,00</span>
              <button
                class="bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors focus:ring-2 focus:outline-none"
              >
                Agendar
              </button>
            </div>
          </article>

          <article
            class="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <div
              class="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-700"
            >
              <span
                class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300 flex h-8 w-8 items-center justify-center rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3" />
                </svg>
              </span>
              <h3 class="font-semibold text-neutral-800 dark:text-neutral-100">Microagulhamento</h3>
            </div>
            <div class="flex-1 px-5 py-4 text-sm text-neutral-700 dark:text-neutral-300">
              Estimula a produção de colágeno, reduzindo cicatrizes, poros dilatados e sinais de
              envelhecimento.
            </div>
            <div
              class="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700"
            >
              <span class="text-primary-600 dark:text-primary-300 font-bold">R$ 280,00</span>
              <button
                class="bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors focus:ring-2 focus:outline-none"
              >
                Agendar
              </button>
            </div>
          </article>

          <article
            class="flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800"
          >
            <div
              class="flex items-center gap-3 border-b border-neutral-100 px-5 py-4 dark:border-neutral-700"
            >
              <span
                class="bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300 flex h-8 w-8 items-center justify-center rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <h3 class="font-semibold text-neutral-800 dark:text-neutral-100">
                Peeling de Diamante
              </h3>
            </div>
            <div class="flex-1 px-5 py-4 text-sm text-neutral-700 dark:text-neutral-300">
              Esfoliação mecânica que renova a superfície da pele, uniformizando o tom e a textura.
            </div>
            <div
              class="flex items-center justify-between border-t border-neutral-100 px-5 py-3 dark:border-neutral-700"
            >
              <span class="text-primary-600 dark:text-primary-300 font-bold">R$ 180,00</span>
              <button
                class="bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors focus:ring-2 focus:outline-none"
              >
                Agendar
              </button>
            </div>
          </article>
        </div>
      </section>

      <!-- ===================== DIVIDER ===================== -->
      <section aria-labelledby="sec-divider">
        <h2 id="sec-divider" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Divider
        </h2>
        <div class="space-y-4">
          <hr class="border-neutral-200 dark:border-neutral-700" />
          <div class="flex items-center gap-4">
            <hr class="flex-1 border-neutral-200 dark:border-neutral-700" />
            <span
              class="text-xs font-medium tracking-widest text-neutral-700 uppercase dark:text-neutral-300"
              >ou</span
            >
            <hr class="flex-1 border-neutral-200 dark:border-neutral-700" />
          </div>
          <hr class="border-primary-200 dark:border-primary-800" />
        </div>
      </section>

      <!-- ===================== TABS ===================== -->
      <section aria-labelledby="sec-tabs">
        <h2 id="sec-tabs" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Tabs
        </h2>
        <div>
          <div
            role="tablist"
            class="flex gap-1 border-b border-neutral-200 dark:border-neutral-700"
          >
            <button
              role="tab"
              aria-selected="true"
              aria-controls="tab-panel-1"
              class="text-primary-600 border-primary-500 dark:text-primary-300 -mb-px border-b-2 px-5 py-2.5 text-sm font-semibold focus:outline-none"
            >
              Facial
            </button>
            <button
              role="tab"
              aria-selected="false"
              aria-controls="tab-panel-2"
              class="hover:text-primary-500 -mb-px border-b-2 border-transparent px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors focus:outline-none dark:text-neutral-300"
            >
              Corporal
            </button>
            <button
              role="tab"
              aria-selected="false"
              aria-controls="tab-panel-3"
              class="hover:text-primary-500 -mb-px border-b-2 border-transparent px-5 py-2.5 text-sm font-medium text-neutral-700 transition-colors focus:outline-none dark:text-neutral-300"
            >
              Depilação
            </button>
          </div>
          <div
            id="tab-panel-1"
            role="tabpanel"
            class="py-5 text-sm text-neutral-700 dark:text-neutral-300"
          >
            Conteúdo da aba <strong>Facial</strong>: Limpeza de Pele, Hidratação, Microagulhamento,
            Peeling de Diamante.
          </div>
        </div>
      </section>

      <!-- ===================== STEPPER ===================== -->
      <section aria-labelledby="sec-stepper">
        <h2 id="sec-stepper" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Stepper
        </h2>

        <!-- Horizontal -->
        <p class="mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Horizontal</p>
        <ol class="flex items-center gap-0">
          <li class="flex flex-1 items-center">
            <div class="flex flex-col items-center gap-1">
              <span
                class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                >1</span
              >
              <span class="text-primary-600 dark:text-primary-300 text-xs font-medium"
                >Serviço</span
              >
            </div>
            <div class="bg-primary-300 dark:bg-primary-700 mx-2 h-0.5 flex-1"></div>
          </li>
          <li class="flex flex-1 items-center">
            <div class="flex flex-col items-center gap-1">
              <span
                class="bg-primary-500 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                >2</span
              >
              <span class="text-primary-600 dark:text-primary-300 text-xs font-medium">Data</span>
            </div>
            <div class="mx-2 h-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700"></div>
          </li>
          <li class="flex flex-1 items-center">
            <div class="flex flex-col items-center gap-1">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 text-sm font-bold text-neutral-700 dark:border-neutral-500 dark:text-neutral-300"
                >3</span
              >
              <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300">Dados</span>
            </div>
            <div class="mx-2 h-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700"></div>
          </li>
          <li class="flex flex-col items-center gap-1">
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 text-sm font-bold text-neutral-700 dark:border-neutral-500 dark:text-neutral-300"
              >4</span
            >
            <span class="text-xs font-medium text-neutral-700 dark:text-neutral-300"
              >Confirmação</span
            >
          </li>
        </ol>

        <!-- Vertical -->
        <p class="mt-8 mb-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">Vertical</p>
        <ol class="flex flex-col gap-0">
          <li class="flex gap-4">
            <div class="flex flex-col items-center">
              <span
                class="bg-primary-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                >1</span
              >
              <div class="bg-primary-200 dark:bg-primary-800 my-1 w-0.5 flex-1"></div>
            </div>
            <div class="pb-6">
              <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Escolha o serviço
              </p>
              <p class="mt-0.5 text-xs text-neutral-700 dark:text-neutral-300">
                Selecione o tratamento desejado.
              </p>
            </div>
          </li>
          <li class="flex gap-4">
            <div class="flex flex-col items-center">
              <span
                class="bg-primary-500 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                >2</span
              >
              <div class="my-1 w-0.5 flex-1 bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
            <div class="pb-6">
              <p class="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                Escolha a data
              </p>
              <p class="mt-0.5 text-xs text-neutral-700 dark:text-neutral-300">
                Selecione o dia e horário disponível.
              </p>
            </div>
          </li>
          <li class="flex gap-4">
            <div class="flex flex-col items-center">
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 text-sm font-bold text-neutral-700 dark:border-neutral-500 dark:text-neutral-300"
                >3</span
              >
            </div>
            <div class="pb-2">
              <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Confirmação
              </p>
              <p class="mt-0.5 text-xs text-neutral-700 dark:text-neutral-300">
                Revise e confirme seu agendamento.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <!-- ===================== ACCORDION ===================== -->
      <section aria-labelledby="sec-accordion">
        <h2
          id="sec-accordion"
          class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold"
        >
          Accordion / Expansion Panel
        </h2>
        <div
          class="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700"
        >
          <details class="group" open>
            <summary
              class="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              O que é Microagulhamento?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="text-primary-500 h-4 w-4 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-5 pb-4 text-sm text-neutral-700 dark:text-neutral-300">
              O microagulhamento é um procedimento estético minimamente invasivo que utiliza
              microagulhas para estimular a produção de colágeno e elastina na pele.
            </div>
          </details>
          <details class="group">
            <summary
              class="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Quanto tempo dura a limpeza de pele?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="text-primary-500 h-4 w-4 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-5 pb-4 text-sm text-neutral-700 dark:text-neutral-300">
              A limpeza de pele profissional dura em média 60 a 90 minutos, dependendo do tipo de
              pele e das necessidades individuais.
            </div>
          </details>
          <details class="group">
            <summary
              class="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800"
            >
              Posso fazer depilação com a pele sensível?
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="text-primary-500 h-4 w-4 transition-transform group-open:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="px-5 pb-4 text-sm text-neutral-700 dark:text-neutral-300">
              Sim! Utilizamos técnicas e produtos específicos para peles sensíveis, garantindo
              conforto e segurança durante o procedimento.
            </div>
          </details>
        </div>
      </section>

      <!-- ===================== PROGRESS BAR & SPINNER ===================== -->
      <section aria-labelledby="sec-progress">
        <h2
          id="sec-progress"
          class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold"
        >
          Progress Bar &amp; Spinner
        </h2>
        <div class="space-y-5">
          <div>
            <div
              class="mb-1.5 flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <span>Progresso do agendamento</span><span>75%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow="75"
              aria-valuemin="0"
              aria-valuemax="100"
              class="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
            >
              <div class="bg-primary-500 h-full w-3/4 rounded-full transition-all"></div>
            </div>
          </div>
          <div>
            <div
              class="mb-1.5 flex justify-between text-xs font-medium text-neutral-700 dark:text-neutral-300"
            >
              <span>Carregando dados</span><span>40%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow="40"
              aria-valuemin="0"
              aria-valuemax="100"
              class="h-2.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700"
            >
              <div class="bg-primary-300 h-full w-2/5 rounded-full transition-all"></div>
            </div>
          </div>
          <!-- Spinner -->
          <div class="flex items-center gap-4 pt-2">
            <div role="status" aria-label="Carregando">
              <svg
                class="text-primary-500 h-8 w-8 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
            <span class="text-sm text-neutral-700 dark:text-neutral-300">Carregando...</span>
          </div>
        </div>
      </section>

      <!-- ===================== SIDENAV (estrutura visual) ===================== -->
      <section aria-labelledby="sec-sidenav">
        <h2 id="sec-sidenav" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Sidenav / Sidebar
        </h2>
        <div
          class="flex h-72 gap-0 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700"
        >
          <nav
            class="flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-200 bg-white px-2 py-4 dark:border-neutral-700 dark:bg-neutral-800"
          >
            <a
              href="#"
              class="bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-200 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </a>
            <a
              href="#"
              class="hover:text-primary-600 dark:hover:text-primary-200 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Agendamentos
            </a>
            <a
              href="#"
              class="hover:text-primary-600 dark:hover:text-primary-200 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Clientes
            </a>
            <a
              href="#"
              class="hover:text-primary-600 dark:hover:text-primary-200 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Relatórios
            </a>
            <div class="mt-auto">
              <a
                href="#"
                class="hover:text-primary-600 dark:hover:text-primary-200 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Configurações
              </a>
            </div>
          </nav>
          <div
            class="flex flex-1 items-center justify-center bg-neutral-50 p-6 text-sm text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
          >
            Área de conteúdo principal
          </div>
        </div>
      </section>

      <!-- ===================== DROPDOWN MENU ===================== -->
      <section aria-labelledby="sec-menu">
        <h2 id="sec-menu" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Menu (Dropdown)
        </h2>
        <div class="relative inline-block">
          <button
            class="hover:border-primary-400 focus:ring-primary-400 flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors focus:ring-2 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
          >
            Opções
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- Dropdown panel (always visible for demo) -->
          <div
            class="absolute left-0 z-10 mt-2 w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
          >
            <a
              href="#"
              class="hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-200 flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 transition-colors dark:text-neutral-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Editar
            </a>
            <a
              href="#"
              class="hover:bg-primary-50 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-200 flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 transition-colors dark:text-neutral-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Duplicar
            </a>
            <hr class="my-1 border-neutral-100 dark:border-neutral-700" />
            <a
              href="#"
              class="flex items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Excluir
            </a>
          </div>
        </div>
      </section>

      <!-- ===================== TABLE ===================== -->
      <section aria-labelledby="sec-table">
        <h2 id="sec-table" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Tabela
        </h2>
        <div class="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-700">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-neutral-100 dark:bg-neutral-800">
                <tr>
                  <th
                    class="px-5 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Cliente
                  </th>
                  <th
                    class="px-5 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Serviço
                  </th>
                  <th
                    class="px-5 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Data
                  </th>
                  <th
                    class="px-5 py-3 text-left font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Status
                  </th>
                  <th
                    class="px-5 py-3 text-right font-semibold text-neutral-700 dark:text-neutral-300"
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody
                class="divide-y divide-neutral-100 bg-white dark:divide-neutral-700 dark:bg-neutral-900"
              >
                <tr class="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <td class="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                    Ana Paula
                  </td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">Limpeza de Pele</td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">24/05/2026</td>
                  <td class="px-5 py-3">
                    <span
                      class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900 dark:text-green-300"
                      >Confirmado</span
                    >
                  </td>
                  <td
                    class="px-5 py-3 text-right font-semibold text-neutral-800 dark:text-neutral-100"
                  >
                    R$ 120,00
                  </td>
                </tr>
                <tr class="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <td class="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                    Beatriz Lima
                  </td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">Microagulhamento</td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">25/05/2026</td>
                  <td class="px-5 py-3">
                    <span
                      class="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      >Pendente</span
                    >
                  </td>
                  <td
                    class="px-5 py-3 text-right font-semibold text-neutral-800 dark:text-neutral-100"
                  >
                    R$ 280,00
                  </td>
                </tr>
                <tr class="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <td class="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                    Carla Souza
                  </td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">
                    Peeling de Diamante
                  </td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">26/05/2026</td>
                  <td class="px-5 py-3">
                    <span
                      class="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full px-2.5 py-0.5 text-xs font-bold"
                      >Agendado</span
                    >
                  </td>
                  <td
                    class="px-5 py-3 text-right font-semibold text-neutral-800 dark:text-neutral-100"
                  >
                    R$ 180,00
                  </td>
                </tr>
                <tr class="hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <td class="px-5 py-3 font-medium text-neutral-800 dark:text-neutral-100">
                    Daniela Melo
                  </td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">Depilação</td>
                  <td class="px-5 py-3 text-neutral-700 dark:text-neutral-300">27/05/2026</td>
                  <td class="px-5 py-3">
                    <span
                      class="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900 dark:text-red-300"
                      >Cancelado</span
                    >
                  </td>
                  <td
                    class="px-5 py-3 text-right font-semibold text-neutral-800 dark:text-neutral-100"
                  >
                    R$ 90,00
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Paginator -->
        <div
          class="mt-4 flex items-center justify-between text-sm text-neutral-700 dark:text-neutral-300"
        >
          <span>Mostrando 1–4 de 24 resultados</span>
          <nav aria-label="Paginação" class="flex items-center gap-1">
            <button
              disabled
              class="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-lg border border-neutral-200 text-neutral-300 dark:border-neutral-700 dark:text-neutral-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              class="bg-primary-500 focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-white focus:ring-2 focus:outline-none"
            >
              1
            </button>
            <button
              class="hover:border-primary-400 hover:text-primary-600 focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-xs transition-colors focus:ring-2 focus:outline-none dark:border-neutral-700"
            >
              2
            </button>
            <button
              class="hover:border-primary-400 hover:text-primary-600 focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-xs transition-colors focus:ring-2 focus:outline-none dark:border-neutral-700"
            >
              3
            </button>
            <span class="px-1">…</span>
            <button
              class="hover:border-primary-400 hover:text-primary-600 focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-xs transition-colors focus:ring-2 focus:outline-none dark:border-neutral-700"
            >
              6
            </button>
            <button
              class="hover:border-primary-400 hover:text-primary-600 focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 transition-colors focus:ring-2 focus:outline-none dark:border-neutral-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </nav>
        </div>
      </section>

      <!-- ===================== DIALOG / MODAL ===================== -->
      <section aria-labelledby="sec-modal">
        <h2 id="sec-modal" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Dialog / Modal
        </h2>
        <!-- Static demo (dialog element shown inline) -->
        <div
          class="relative flex min-h-48 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-100 p-8 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <dialog
            open
            class="relative m-0 w-full max-w-md overflow-hidden rounded-xl border border-neutral-200 bg-white p-0 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800"
          >
            <div
              class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 dark:border-neutral-700"
            >
              <h3 class="font-bold text-neutral-800 dark:text-neutral-100">
                Confirmar Agendamento
              </h3>
              <button
                aria-label="Fechar"
                class="focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 focus:ring-2 focus:outline-none dark:hover:bg-neutral-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="px-6 py-5 text-sm text-neutral-700 dark:text-neutral-300">
              Deseja confirmar o agendamento de
              <strong class="text-neutral-800 dark:text-neutral-100">Limpeza de Pele</strong>
              para o dia
              <strong class="text-neutral-800 dark:text-neutral-100">24/05/2026 às 10h</strong>?
            </div>
            <div
              class="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4 dark:border-neutral-700"
            >
              <button
                class="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-neutral-300 focus:outline-none dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                Cancelar
              </button>
              <button
                class="bg-primary-500 hover:bg-primary-600 focus:ring-primary-400 rounded-full px-5 py-2 text-sm font-semibold text-white transition-colors focus:ring-2 focus:outline-none"
              >
                Confirmar
              </button>
            </div>
          </dialog>
        </div>
      </section>

      <!-- ===================== SNACKBAR / TOAST ===================== -->
      <section aria-labelledby="sec-toast">
        <h2 id="sec-toast" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Snackbar / Toast
        </h2>
        <div class="flex max-w-sm flex-col gap-3">
          <!-- Success -->
          <div
            role="alert"
            class="flex items-center gap-3 rounded-xl bg-green-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Agendamento confirmado com sucesso!
            <button
              aria-label="Fechar"
              class="ml-auto shrink-0 hover:opacity-75 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Error -->
          <div
            role="alert"
            class="flex items-center gap-3 rounded-xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Erro ao processar. Tente novamente.
            <button
              aria-label="Fechar"
              class="ml-auto shrink-0 hover:opacity-75 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <!-- Brand -->
          <div
            role="alert"
            class="bg-primary-500 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Lembrete: sua consulta é amanhã às 10h.
            <button
              aria-label="Fechar"
              class="ml-auto shrink-0 hover:opacity-75 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- ===================== TOOLTIP ===================== -->
      <section aria-labelledby="sec-tooltip">
        <h2 id="sec-tooltip" class="text-primary-800 dark:text-primary-300 mb-6 text-2xl font-bold">
          Tooltip
        </h2>
        <div class="flex flex-wrap items-center gap-8">
          <div class="group relative inline-flex">
            <button
              class="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 focus:ring-primary-400 rounded-full px-4 py-2 text-sm font-medium focus:ring-2 focus:outline-none"
            >
              Passe o mouse
            </button>
            <div
              role="tooltip"
              class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900"
            >
              Informação adicional
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-100"
              ></div>
            </div>
          </div>
          <div class="group relative inline-flex">
            <button
              aria-label="Ajuda"
              class="hover:border-primary-400 hover:text-primary-600 focus:ring-primary-400 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 text-neutral-500 transition-colors focus:ring-2 focus:outline-none dark:border-neutral-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
            <div
              role="tooltip"
              class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900"
            >
              Clique para obter ajuda
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800 dark:border-t-neutral-100"
              ></div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- ===================== FOOTER ===================== -->
    <footer
      class="mt-20 border-t border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"
    >
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-neutral-700 sm:flex-row dark:text-neutral-300"
      >
        <div class="flex items-center gap-2">
          <span
            class="bg-primary-500 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            >MS</span
          >
          <span class="text-primary-700 dark:text-primary-300 font-semibold">M'Salla Estética</span>
        </div>
        <p>© 2026 M'Salla Estética. Todos os direitos reservados.</p>
        <div class="flex items-center gap-4">
          <a
            href="tel:+5518997130147"
            class="hover:text-primary-500 flex items-center gap-1.5 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            (18) 9 9713-0147
          </a>
          <a
            href="https://instagram.com/marcia_rosanelli"
            class="hover:text-primary-500 flex items-center gap-1.5 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
              />
            </svg>
            @marcia_rosanelli
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class TempComponent {}
