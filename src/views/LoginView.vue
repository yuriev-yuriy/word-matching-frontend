<template>
  <div class="mx-auto w-full max-w-md rounded-2xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-900/60">
    <h2 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Login</h2>

    <p v-if="infoMessage" class="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-300">
      {{ infoMessage }}
    </p>

    <p v-if="errorMessage" class="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-300">
      {{ errorMessage }}
    </p>

    <form class="mt-5 space-y-4" @submit.prevent="submitLogin">
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
          autocomplete="current-password"
          class="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-zinc-900 outline-none ring-indigo-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          required
        />
        <p v-if="validationErrors.password" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ validationErrors.password }}
        </p>
      </div>

      <button
        type="submit"
        class="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? "Signing in..." : "Login" }}
      </button>
    </form>

    <p class="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
      Don't have an account?
      <router-link to="/register" class="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
        Register
      </router-link>
    </p>
  </div>
</template>

<script>
import api from "../services/api";
import { checkAuth } from "../state/auth";

export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
      submitting: false,
      infoMessage: "",
      errorMessage: "",
      validationErrors: {},
    };
  },
  mounted() {
    if (this.$route.query.verify === "1") {
      this.infoMessage = "Please check your email and verify your account.";
      this.$router.replace({ path: "/login" });
    }
  },
  methods: {
    async submitLogin() {
      this.infoMessage = "";
      this.submitting = true;
      this.errorMessage = "";
      this.validationErrors = {};

      try {
        const response = await api.post("/api/login", {
          email: this.email,
          password: this.password,
        });

        localStorage.setItem("token", response.data.token);

        await checkAuth();
        this.$router.push("/");
      } catch (error) {
        const status = error?.response?.status;

        if (status === 422) {
          const errors = error?.response?.data?.errors || {};
          this.validationErrors = {
            email: errors.email ? errors.email[0] : "",
            password: errors.password ? errors.password[0] : "",
          };
        } else if (status === 403) {
          this.errorMessage = error?.response?.data?.message || "Please verify your email before logging in.";
        } else if (status === 401) {
          this.errorMessage = "Invalid credentials.";
        }
      } finally {
        this.submitting = false;
      }
    },
  },
};
</script>
