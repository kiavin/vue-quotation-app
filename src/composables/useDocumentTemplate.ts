import { shallowRef } from 'vue'
import QuotationTemplateBasic from '@/templates/documents/QuotationTemplateBasic.vue'

export function useDocumentTemplate() {
  const templates: Record<string, any> = {
    basic: QuotationTemplateBasic,
    // future templates like 'modern', 'professional' can be added here
  }

  const currentTemplate = shallowRef(QuotationTemplateBasic)

  function setTemplate(type: string) {
    if (templates[type]) {
      currentTemplate.value = templates[type]
    }
  }

  return {
    currentTemplate,
    setTemplate,
    availableTemplates: Object.keys(templates)
  }
}
