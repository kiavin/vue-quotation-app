<script setup lang="ts">
import { onMounted, ref, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  Plus,
  Trash2,
  Save,
  Send,
  ChevronLeft,
  ShoppingCart,
  Search,
} from "lucide-vue-next";
import { useQuotationStore } from "@/stores/quotations";
import { useCustomerStore } from "@/stores/customers";
import { useCatalogStore } from "@/stores/catalog";
import { useAuthStore } from "@/stores/auth";
import { useSettingsStore } from "@/stores/settings";
import { useCurrency } from "@/composables/useCurrency";
import { type Item } from "@/services/catalogService";
import { type Quotation } from "@/services/quotationService";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { notify } from "@/lib/notify";

const router = useRouter();
const route = useRoute();
const quotationStore = useQuotationStore();
const customerStore = useCustomerStore();
const catalogStore = useCatalogStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const { formatGlobalCurrency: formatCurrency, currencySymbol } = useCurrency();

const isSaving = ref(false);
const isEditing = ref(false);
const catalogSearch = ref("");

const filteredCatalogItems = computed(() => {
  const addedItemIds = new Set(
    quotationStore.currentItems
      .map((i) => i.item_id)
      .filter(Boolean)
  );
  return catalogStore.items.filter((item) => {
    if (addedItemIds.has(item.id)) return false;
    if (catalogSearch.value) {
      return item.name.toLowerCase().includes(catalogSearch.value.toLowerCase());
    }
    return true;
  });
});

const form = reactive({
  customer_id: "",
  title: "",
  number: `QUO-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`,
  date: new Date().toISOString().split("T")[0],
  expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  notes: "",
  status: "draft" as "draft" | "sent" | "approved" | "rejected" | "expired",
});

onMounted(async () => {
  quotationStore.resetBuilder();
  await Promise.all([
    customerStore.fetchCustomers(),
    catalogStore.fetchCatalog(),
    settingsStore.fetchOrganization(),
  ]);

  if (route.params.id) {
    isEditing.value = true;
    try {
      await quotationStore.loadQuotation(route.params.id as string);
      if (quotationStore.currentQuotation) {
        form.customer_id = quotationStore.currentQuotation.customer_id;
        form.title = quotationStore.currentQuotation.title || "";
        form.number = quotationStore.currentQuotation.number;
        form.date = quotationStore.currentQuotation.date;
        form.expiry_date = quotationStore.currentQuotation.expiry_date || "";
        form.notes = quotationStore.currentQuotation.notes || "";
        form.status = quotationStore.currentQuotation.status;
      }
    } catch (error) {
      notify.toast('error', 'Load Failed', 'Could not load the quotation.');
      router.push("/quotations");
    }
  }
});

const handleAddItem = (catalogItem: Item) => {
  quotationStore.addItem({
    item_id: catalogItem.id,
    name: catalogItem.name,
    quantity: 1,
    price: catalogItem.price,
    total: catalogItem.price,
  });
};

const handleSave = async (status: typeof form.status = "draft") => {
  if (!form.customer_id) return notify.toast('warning', 'Missing Customer', 'Please select a customer before saving.');
  if (quotationStore.currentItems.length === 0)
    return notify.toast('warning', 'No Items', 'Please add at least one item.');

  isSaving.value = true;
  const quotationData = {
    ...form,
    status,
    organization_id: authStore.organizationId || "",
    subtotal: quotationStore.subtotal,
    transport_charge: quotationStore.transportCharge,
    tax_rate: quotationStore.taxRate,
    tax_amount: quotationStore.taxAmount,
    total: quotationStore.grandTotal,
    id: isEditing.value ? (route.params.id as string) : undefined,
  };

  const result = await quotationStore.saveQuotation(quotationData as Quotation);

  if (result?.ok) {
    if (status === "sent") {
      const savedId = quotationStore.currentQuotation?.id;
      if (savedId) {
        router.push(`/quotations/${savedId}/print?send=true`);
        isSaving.value = false;
        return;
      }
    }
    router.push("/quotations");
  }
  isSaving.value = false;
};


</script>

<template>
  <div class="space-y-6 pb-24">
    <!-- Header -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div class="flex items-center gap-4">
        <Button variant="ghost" size="icon" @click="router.push('/quotations')">
          <ChevronLeft class="w-5 h-5" />
        </Button>
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">
            {{ isEditing ? "Edit Quotation" : "New Quotation" }}
          </h2>
          <p class="text-slate-500">
            {{ form.number }} •
            {{
              isEditing
                ? "Update existing draft"
                : "Create a professional proposal"
            }}
          </p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <Button
          variant="outline"
          class="gap-2 w-full sm:w-auto"
          @click="handleSave('draft')"
          :disabled="isSaving"
        >
          <Save class="w-4 h-4" />
          {{ isSaving ? "Saving..." : "Save Draft" }}
        </Button>
        <Button class="gap-2 w-full sm:w-auto" @click="handleSave('sent')" :disabled="isSaving">
          <Send class="w-4 h-4" />
          {{ isSaving ? "Sending..." : "Send to Customer" }}
        </Button>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left Column: Items and Customer -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer & Date Selection -->
        <Card>
          <CardHeader>
            <CardTitle>Quotation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 mb-6">
              <Label for="title">Title <span class="text-xs text-slate-400 font-normal">(internal only — not shown on PDF)</span></Label>
              <Input
                id="title"
                v-model="form.title"
                placeholder="e.g. Jane's Wedding Reception 500pax"
              />
            </div>
            <div class="grid gap-6 md:grid-cols-2">
              <div class="space-y-2">
                <Label for="customer">Customer *</Label>
                <select
                  id="customer"
                  v-model="form.customer_id"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select Customer</option>
                  <option
                    v-for="c in customerStore.customers"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.name }}
                  </option>
                </select>
              </div>
              <div class="space-y-2">
                <Label for="number">Quotation Number</Label>
                <Input id="number" v-model="form.number" />
              </div>
              <div class="space-y-2">
                <Label for="date">Issue Date</Label>
                <Input id="date" v-model="form.date" type="date" />
              </div>
              <div class="space-y-2">
                <Label for="expiry">Expiry Date</Label>
                <Input id="expiry" v-model="form.expiry_date" type="date" />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Items Table -->
        <Card>
          <CardHeader class="flex flex-row items-center justify-between">
            <CardTitle>Items & Services</CardTitle>
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-500"
                >{{ quotationStore.currentItems.length }} items added</span
              >
            </div>
          </CardHeader>
          <CardContent class="p-0">
            <div class="relative max-h-96 overflow-y-auto">
              <!-- Desktop Table -->
              <table class="w-full text-sm text-left hidden md:table">
                <thead
                  class="text-xs text-slate-500 uppercase bg-slate-50 border-y"
                >
                  <tr>
                    <th class="px-6 py-3 font-medium">Description</th>
                    <th class="px-6 py-3 font-medium w-36 text-center">Qty</th>
                    <th class="px-6 py-3 font-medium w-32 text-right">Price</th>
                    <th class="px-6 py-3 font-medium w-32 text-right">Total</th>
                    <th class="px-6 py-3 font-medium w-16"></th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr
                    v-for="(item, index) in quotationStore.currentItems"
                    :key="index"
                    class="group hover:bg-slate-50"
                  >
                    <td class="px-6 py-4">
                      <Input
                        v-model="item.name"
                        class="border-transparent bg-transparent hover:border-slate-200 focus:bg-white px-2"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <NumberStepper v-model="item.quantity" :min="1" />
                    </td>
                    <td class="px-6 py-4">
                      <Input
                        v-model.number="item.price"
                        type="number"
                        inputmode="decimal"
                        class="w-24 ml-auto text-right border-transparent bg-transparent hover:border-slate-200 focus:bg-white px-2"
                      />
                    </td>
                    <td class="px-6 py-4 text-right font-medium">
                      {{ formatCurrency(item.quantity * item.price) }}
                    </td>
                    <td class="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        class="text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                        @click="quotationStore.removeItem(index)"
                      >
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- Mobile Card List -->
              <div class="md:hidden divide-y">
                <div 
                  v-for="(item, index) in quotationStore.currentItems" 
                  :key="index" 
                  class="p-4 space-y-4"
                >
                  <div class="flex items-start justify-between gap-4">
                    <Input
                      v-model="item.name"
                      class="font-medium bg-transparent px-2"
                      placeholder="Item Description"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      class="text-red-500 shrink-0"
                      @click="quotationStore.removeItem(index)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <div class="space-y-1">
                      <Label class="text-xs text-slate-500">Qty</Label>
                      <NumberStepper v-model="item.quantity" :min="1" class="w-32" />
                    </div>
                    <div class="space-y-1 text-right">
                      <Label class="text-xs text-slate-500">Price</Label>
                      <Input
                        v-model.number="item.price"
                        type="number"
                        inputmode="decimal"
                        class="w-24 ml-auto text-right bg-transparent px-2"
                      />
                    </div>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t text-sm">
                    <span class="text-slate-500 font-medium">Line Total</span>
                    <span class="font-bold">{{ formatCurrency(item.quantity * item.price) }}</span>
                  </div>
                </div>
              </div>

              <!-- Empty State -->
              <div v-if="quotationStore.currentItems.length === 0" class="px-6 py-12 text-center text-slate-500 border-y">
                <ShoppingCart
                  class="w-8 h-8 mx-auto mb-2 text-slate-200"
                />
                <p>
                  No items added yet. Search the catalog to add items.
                </p>
              </div>
            </div>

            <!-- Quick Add from Catalog -->
            <div class="p-6 bg-slate-50 border-t">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-sm font-semibold text-slate-900">
                  Quick Add from Catalog
                </h4>
                <span class="text-xs text-slate-400">
                  {{ filteredCatalogItems.length }} items available
                </span>
              </div>
              <div class="relative mb-3">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  v-model="catalogSearch"
                  placeholder="Search catalog items..."
                  class="pl-9 h-9 bg-white"
                />
              </div>
              <div class="max-h-64 overflow-y-auto rounded-md space-y-2 pr-1">
                <div
                  v-for="catItem in filteredCatalogItems"
                  :key="catItem.id"
                  class="flex items-center justify-between p-3 bg-white rounded-md border text-sm hover:border-primary cursor-pointer transition-colors"
                  @click="handleAddItem(catItem)"
                >
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{{ catItem.name }}</p>
                    <p class="text-xs text-slate-500">
                      {{ formatCurrency(catItem.price) }} / {{ catItem.unit }}
                    </p>
                  </div>
                  <Plus class="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div
                  v-if="filteredCatalogItems.length === 0"
                  class="py-6 text-center text-sm text-slate-400"
                >
                  {{ catalogStore.items.length === 0 ? 'No catalog items found.' : catalogSearch ? 'No matching items.' : 'All catalog items have been added.' }}
                </div>
              </div>
              <Button
                variant="link"
                class="mt-4 px-0 h-auto text-slate-500 hover:text-primary"
                @click="router.push('/catalog')"
              >
                Go to Catalog →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Column: Summary -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div class="flex justify-between text-sm">
                <span class="text-slate-500">Subtotal</span>
                <span>{{ formatCurrency(quotationStore.subtotal) }}</span>
              </div>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between text-sm items-center">
                  <span class="text-slate-500">Transport Charge</span>
                  <div class="relative w-28">
                    <span
                      class="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                      >{{ currencySymbol }}</span
                    >
                    <Input
                      v-model.number="quotationStore.transportCharge"
                      type="number"
                      class="pl-6 h-8 text-right"
                    />
                  </div>
                </div>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-500"
                  >Tax ({{ quotationStore.taxRate * 100 }}%)</span
                >
                <span>{{ formatCurrency(quotationStore.taxAmount) }}</span>
              </div>
              <div class="border-t pt-4 mt-4 flex justify-between items-center">
                <span class="font-bold text-lg text-slate-900">Total</span>
                <span class="font-bold text-2xl text-primary">{{
                  formatCurrency(quotationStore.grandTotal)
                }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              v-model="form.notes"
              placeholder="Private notes, internal terms, or specific instructions..."
              class="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            ></textarea>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
