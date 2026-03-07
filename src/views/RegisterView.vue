<template>
  <div class="mx-auto w-full max-w-md rounded-2xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-900/60">
    <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Register</h2>

    <p v-if="generalError" class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
      {{ generalError }}
    </p>

    <form class="mt-5 space-y-4" @submit.prevent="submitRegister">
      <div>
        <label for="name" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
        <input
          id="name"
          v-model="name"
          type="text"
          autocomplete="name"
          class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          required
        />
        <p v-if="validationErrors.name" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationErrors.name }}
        </p>
      </div>

      <div>
        <label for="email" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          required
        />
        <p v-if="validationErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationErrors.email }}
        </p>
      </div>

      <div>
        <label for="password" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          required
        />
        <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationErrors.password }}
        </p>
      </div>

      <div>
        <label for="password_confirmation" class="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Confirm Password</label>
        <input
          id="password_confirmation"
          v-model="password_confirmation"
          type="password"
          autocomplete="new-password"
          class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          required
        />
      </div>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? "Creating account..." : "Register" }}
      </button>
    </form>
  </div>
</template>

<script>
import api from "../services/api";
import { checkAuth } from "../state/auth";

export default {
  name: "RegisterView",
  data() {
    return {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      submitting: false,
      generalError: "",
      validationErrors: {},
    };
  },
  methods: {
    async submitRegister() {
      this.submitting = true;
      this.generalError = "";
      this.validationErrors = {};

      try {
        // await api.get("/sanctum/csrf-cookie");

        await api.post("/api/register", {
          name: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.password_confirmation,
        });

        await checkAuth();
        this.$router.push("/");
      } catch (error) {
        const status = error?.response?.status;

        if (status === 422) {
          const errors = error?.response?.data?.errors || {};
          this.validationErrors = {
            name: errors.name ? errors.name[0] : "",
            email: errors.email ? errors.email[0] : "",
            password: errors.password ? errors.password[0] : "",
          };
        } else {
          this.generalError = "Unable to register. Please try again.";
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
