import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { getCurrencyByCode } from '@/utils/currencies';
import { useRoute } from 'vue-router';

export function useCurrency() {
  const authStore = useAuthStore();
  const route = useRoute();

  const isAdminRoute = computed(() => route.path.startsWith('/admin'));

  const currentCurrencyCode = computed(() => {
    // If it's an admin route, default to KES
    if (isAdminRoute.value) {
      return 'KES';
    }
    // Otherwise, use the organization's currency, fallback to USD
    return authStore.organization?.currency || 'USD';
  });

  const currencySymbol = computed(() => {
    const currency = getCurrencyByCode(currentCurrencyCode.value);
    return currency ? currency.symbol : '$';
  });

  function formatGlobalCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrencyCode.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return {
    currentCurrencyCode,
    currencySymbol,
    formatGlobalCurrency,
  };
}
