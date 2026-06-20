<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Save } from "lucide-vue-next";
import {
  TEMPLATE_VARIANTS,
  DEFAULT_TEMPLATE,
  type TemplateVariantId,
} from "@/templates/documents";

const settingsStore = useSettingsStore();
const isSaving = ref(false);

const form = ref({
  name: "",
  primary_color: "#0F766E",
  secondary_color: "#0EA5E9",
  accent_color: "#F59E0B",
  address: "",
  phone: "",
  email: "",
  currency: "USD",
});

const selectedVariantId = ref<TemplateVariantId>(DEFAULT_TEMPLATE);

// Dynamic Scaling Logic
const previewContainer = ref<HTMLElement | null>(null);
const innerDocRef = ref<HTMLElement | null>(null);
const previewScale = ref(0.65);
const documentHeight = ref(1123);
let resizeObserver: ResizeObserver | null = null;
let docResizeObserver: ResizeObserver | null = null;

const previewData = {
  number: "QUO-2026-001",
  date: new Date().toISOString(),
  expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  status: "draft",
  customer: {
    name: "Sample Client LLC",
    email: "contact@sampleclient.com",
    phone: "+1 (555) 123-4567",
    address: "456 Client Road\nSuite 100\nBusiness City, BC 12345",
  },
  items: [
    {
      name: "Premium Catering Package",
      description: "Gourmet meal for 50 guests",
      quantity: 1,
      price: 1500,
      total: 1500,
    },
    {
      name: "Staffing Services",
      description: "2 Waitstaff, 1 Bartender (4 hours)",
      quantity: 1,
      price: 450,
      total: 450,
    },
  ],
  subtotal: 1950,
  transport_charge: 50,
  tax_rate: 0.1,
  tax_amount: 200,
  total: 2200,
  notes: "Thank you for your inquiry. This quote is valid for 14 days.",
};

onMounted(async () => {
  // Setup ResizeObserver for perfect scaling
  resizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      // 210mm is approx 793.7px at 96dpi
      const availableWidth = entry.contentRect.width;
      // Scale down so 794px fits into available width exactly
      previewScale.value = availableWidth / 794;
    }
  });

  if (previewContainer.value) {
    resizeObserver.observe(previewContainer.value);
  }

  docResizeObserver = new ResizeObserver((entries) => {
    for (let entry of entries) {
      documentHeight.value = entry.contentRect.height;
    }
  });

  if (innerDocRef.value) {
    docResizeObserver.observe(innerDocRef.value);
  }

  // Load saved preference
  const saved = localStorage.getItem(
    "document_template_variant",
  ) as TemplateVariantId;
  if (saved && Object.keys(TEMPLATE_VARIANTS).includes(saved)) {
    selectedVariantId.value = saved;
  }

  await settingsStore.fetchOrganization();
  if (settingsStore.organization) {
    form.value = {
      name: settingsStore.organization.name || "",
      primary_color: settingsStore.organization.primary_color || "#0F766E",
      secondary_color: settingsStore.organization.secondary_color || "#0EA5E9",
      accent_color: settingsStore.organization.accent_color || "#F59E0B",
      address: settingsStore.organization.address || "",
      phone: settingsStore.organization.phone || "",
      email: settingsStore.organization.email || "",
      currency: settingsStore.organization.currency || "USD",
    };
  }
});

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  if (docResizeObserver) {
    docResizeObserver.disconnect();
  }
});

const activeTemplateComponent = computed(() => {
  return TEMPLATE_VARIANTS[selectedVariantId.value].quotation;
});

const computedBranding = computed(() => {
  return {
    name: form.value.name || "Your Business Name",
    logo_url: settingsStore.organization?.logo_url || null,
    primary_color: form.value.primary_color,
    secondary_color: form.value.secondary_color,
    accent_color: form.value.accent_color,
    address: form.value.address || "123 Business Rd, City, Country",
    phone: form.value.phone || "+1 (555) 000-0000",
    email: form.value.email || "hello@yourbusiness.com",
    currency: form.value.currency,
  };
});

const handleTemplateChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const val = target.value as TemplateVariantId;
  selectedVariantId.value = val;
  localStorage.setItem("document_template_variant", val);
};

async function handleSave() {
  isSaving.value = true;
  try {
    await settingsStore.updateOrganization(form.value);
  } finally {
    isSaving.value = false;
  }
}

async function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await settingsStore.uploadLogo(target.files[0]);
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Branding</h1>
        <p class="text-muted-foreground">
          Customize your organization's visual identity and profile.
        </p>
      </div>
      <Button @click="handleSave" :disabled="isSaving" class="w-full sm:w-auto">
        <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
        <Save v-else class="mr-2 h-4 w-4" />
        Save Changes
      </Button>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Branding Form -->
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-2">
              <Label for="name">Business Name</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="Acme Catering"
              />
            </div>

            <div class="grid gap-2">
              <Label>Logo</Label>
              <div class="flex items-center gap-4">
                <div
                  class="h-20 w-20 rounded-md border bg-muted flex items-center justify-center overflow-hidden"
                >
                  <img
                    v-if="settingsStore.organization?.logo_url"
                    :src="settingsStore.organization.logo_url"
                    alt="Logo"
                    class="h-full w-full object-contain"
                  />
                  <Upload v-else class="h-8 w-8 text-muted-foreground" />
                </div>
                <div class="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    @change="handleLogoUpload"
                    class="hidden"
                    id="logo-upload"
                  />
                  <Label for="logo-upload" class="cursor-pointer">
                    <Button variant="outline" type="button" as-child>
                      <span>Change Logo</span>
                    </Button>
                  </Label>
                  <p class="text-xs text-muted-foreground mt-2">
                    Recommended: Square SVG or PNG. Max 2MB.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-2">
              <Label for="email">Public Email</Label>
              <Input
                id="email"
                v-model="form.email"
                placeholder="contact@acme.com"
              />
            </div>

            <div class="grid gap-2">
              <Label for="phone">Phone Number</Label>
              <Input
                id="phone"
                v-model="form.phone"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div class="grid gap-2">
              <Label for="address">Address</Label>
              <Input
                id="address"
                v-model="form.address"
                placeholder="123 Main St, City, Country"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Colors & Theme</CardTitle>
          </CardHeader>
          <CardContent class="grid gap-4 sm:grid-cols-3">
            <div class="grid gap-2">
              <Label for="primary">Primary</Label>
              <div class="flex gap-2">
                <Input
                  id="primary"
                  type="color"
                  v-model="form.primary_color"
                  class="w-12 h-10 p-1"
                />
                <Input v-model="form.primary_color" class="font-mono text-xs" />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="secondary">Secondary</Label>
              <div class="flex gap-2">
                <Input
                  id="secondary"
                  type="color"
                  v-model="form.secondary_color"
                  class="w-12 h-10 p-1"
                />
                <Input
                  v-model="form.secondary_color"
                  class="font-mono text-xs"
                />
              </div>
            </div>
            <div class="grid gap-2">
              <Label for="accent">Accent</Label>
              <div class="flex gap-2">
                <Input
                  id="accent"
                  type="color"
                  v-model="form.accent_color"
                  class="w-12 h-10 p-1"
                />
                <Input v-model="form.accent_color" class="font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Live Preview -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">Live Document Preview</h2>
          <div class="flex items-center gap-2">
            <label
              for="preview-template"
              class="text-xs font-medium text-slate-500 uppercase tracking-wider"
              >Style:</label
            >
            <select
              id="preview-template"
              :value="selectedVariantId"
              @change="handleTemplateChange"
              class="text-sm border-slate-200 rounded-md py-1 pl-2 pr-8 focus:ring-primary focus:border-primary"
            >
              <option
                v-for="(config, id) in TEMPLATE_VARIANTS"
                :key="id"
                :value="id"
              >
                {{ config.label }}
              </option>
            </select>
          </div>
        </div>

        <Card
          class="border border-slate-200 shadow-xl bg-slate-100 p-0 sm:p-4 overflow-hidden"
        >
          <!-- The container that ResizeObserver watches -->
          <div ref="previewContainer" class="w-full flex justify-center">
            <!-- Scaled wrapper that reserves the exact scaled layout space -->
            <div
              class="relative bg-white shadow-sm border border-slate-200 overflow-hidden"
              :style="{
                width: `${794 * previewScale}px`,
                height: `${documentHeight * previewScale}px`,
                transition: 'height 0.2s ease-out'
              }"
            >
              <!-- The actual document template at fixed A4 pixel size, scaled from top-left -->
              <div
                ref="innerDocRef"
                class="absolute top-0 left-0 bg-white"
                :style="{
                  width: '794px',
                  minHeight: '1123px',
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }"
              >
                <component
                  :is="activeTemplateComponent"
                  :data="previewData"
                  :branding="computedBranding"
                />
              </div>
            </div>
          </div>
        </Card>
        <p class="text-center text-xs text-muted-foreground italic">
          This preview updates in real-time as you change your branding
          settings. Scale is adjusted to fit your screen.
        </p>
      </div>
    </div>
  </div>
</template>
